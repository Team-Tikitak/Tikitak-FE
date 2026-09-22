param(
  [Parameter(Mandatory = $true)]
  [string]$CommentsPath,

  [int]$PrNumber,

  [string]$PrUrl,

  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Fail($Message) {
  Write-Error $Message
  exit 1
}

function Load-DotEnv {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [switch]$Override
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith('#')) {
      continue
    }

    if ($trimmed -notmatch '^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
      continue
    }

    $key = $Matches[1]
    $value = $Matches[2].Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ($Override -or -not [Environment]::GetEnvironmentVariable($key, 'Process')) {
      [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
  }
}

function Resolve-Gh {
  $command = Get-Command gh -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $defaultPath = 'C:\Program Files\GitHub CLI\gh.exe'
  if (Test-Path -LiteralPath $defaultPath) {
    return $defaultPath
  }

  return $null
}

function Invoke-GhApi {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Method,

    [Parameter(Mandatory = $true)]
    [string]$Endpoint,

    [object]$Body
  )

  if (-not $script:GhPath) {
    Fail 'GitHub CLI (gh) was not found. Install gh or add it to PATH.'
  }

  $args = @(
    'api',
    '-X', $Method,
    $Endpoint,
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'X-GitHub-Api-Version: 2022-11-28'
  )

  $tempPath = $null
  if ($null -ne $Body) {
    $json = $Body | ConvertTo-Json -Depth 20
    $tempPath = Join-Path (Get-Location) ('tmp\gh-api-{0}.json' -f ([guid]::NewGuid().ToString('N')))
    $tempDir = Split-Path -Parent $tempPath
    if (-not (Test-Path -LiteralPath $tempDir)) {
      New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($tempPath, $json, $utf8NoBom)
    $args += @('--input', $tempPath)
  }

  try {
    $output = & $script:GhPath @args 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw (($output | Out-String).Trim())
    }

    return $output
  } finally {
    if ($tempPath -and (Test-Path -LiteralPath $tempPath)) {
      Remove-Item -LiteralPath $tempPath -Force
    }
  }
}

function Invoke-GitHubApi {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Method,

    [Parameter(Mandatory = $true)]
    [string]$Uri,

    [object]$Body
  )

  $headers = @{
    Authorization = "Bearer $script:Token"
    Accept = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
    'User-Agent' = 'claude-pr-inline-review'
  }

  if ($null -ne $Body) {
    $json = $Body | ConvertTo-Json -Depth 20
    $utf8Body = [System.Text.Encoding]::UTF8.GetBytes($json)
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -ContentType 'application/json; charset=utf-8' -Body $utf8Body
  }

  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers
}

function Remove-CommentsFileAfterSuccess {
  if (Test-Path -LiteralPath $CommentsPath) {
    Remove-Item -LiteralPath $CommentsPath -Force
    Write-Output "Deleted completed review payload: $CommentsPath"
  }
}

function Test-IgnoredReviewPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $normalizedPath = $Path -replace '\\', '/'

  if ($normalizedPath -eq 'yarn.lock') { return $true }
  if ($normalizedPath -like '.pnp.*') { return $true }
  if ($normalizedPath -like '.yarn/*') { return $true }
  if ($normalizedPath -like 'coverage/*') { return $true }
  if ($normalizedPath -like '*/storybook-static/*' -or $normalizedPath -like 'storybook-static/*') { return $true }
  if ($normalizedPath -like '*.png') { return $true }
  if ($normalizedPath -like '*.jpg') { return $true }
  if ($normalizedPath -like '*.jpeg') { return $true }
  if ($normalizedPath -like '*.gif') { return $true }
  if ($normalizedPath -like '*.webp') { return $true }
  if ($normalizedPath -like '*.svg') { return $true }
  if ($normalizedPath -like '*.ico') { return $true }
  if ($normalizedPath -like '*.snap') { return $true }

  return $false
}

function New-FallbackReviewBody {
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add($reviewBody)
  $lines.Add('')
  $lines.Add('Inline review comments could not be anchored by GitHub, so the findings are listed here.')
  $lines.Add('')

  foreach ($comment in $normalizedComments) {
    $location = if ($comment.line) {
      "$($comment.path):$($comment.line)"
    } elseif ($comment.position) {
      "$($comment.path) (diff position $($comment.position))"
    } else {
      $comment.path
    }

    $lines.Add("- ``$location``")
    $lines.Add("  $($comment.body)")
  }

  return ($lines -join [Environment]::NewLine)
}

if (-not (Test-Path -LiteralPath $CommentsPath)) {
  Fail "Comments file not found: $CommentsPath"
}

$commentsJson = Get-Content -LiteralPath $CommentsPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $commentsJson.comments -or $commentsJson.comments.Count -eq 0) {
  Fail 'Comments file must contain a non-empty comments array.'
}

Load-DotEnv -Path (Join-Path (Get-Location) '.env.pr-inline-review') -Override
Load-DotEnv -Path (Join-Path (Get-Location) '.env.local')
Load-DotEnv -Path (Join-Path (Get-Location) '.env')

if (-not $env:GH_TOKEN -and $env:GITHUB_TOKEN) {
  $env:GH_TOKEN = $env:GITHUB_TOKEN
}

$script:Token = if ($env:GH_TOKEN) { $env:GH_TOKEN } elseif ($env:GITHUB_TOKEN) { $env:GITHUB_TOKEN } else { $null }
if (-not $script:Token) {
  Fail 'Set GITHUB_TOKEN or GH_TOKEN in the shell, .env.local, or .env before running this script.'
}

$script:GhPath = Resolve-Gh

$owner = $null
$repoName = $null
if ($PrUrl) {
  if ($PrUrl -notmatch '^https://github\.com/([^/]+)/([^/]+)/pull/(\d+)(?:[/?#].*)?$') {
    Fail "Invalid GitHub PR URL: $PrUrl"
  }

  $owner = $Matches[1]
  $repoName = $Matches[2]
  $PrNumber = [int]$Matches[3]
} else {
  $remote = git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $remote) {
    Fail 'Could not infer repository from git remote. Provide -PrUrl.'
  }

  if ($remote -match 'github\.com[:/]([^/]+)/([^/.]+)(?:\.git)?$') {
    $owner = $Matches[1]
    $repoName = $Matches[2]
  } else {
    Fail "Could not parse GitHub repository from origin remote: $remote. Provide -PrUrl."
  }
}

if (-not $PrNumber) {
  Fail 'PrNumber is required when PrUrl is not provided. Pass -PrNumber or -PrUrl.'
}

$pr = Invoke-GitHubApi -Method Get -Uri "https://api.github.com/repos/$owner/$repoName/pulls/$PrNumber"
$headSha = $pr.head.sha
if (-not $headSha) {
  Fail 'Could not resolve PR head SHA.'
}

$normalizedComments = @()
foreach ($comment in $commentsJson.comments) {
  if (-not $comment.path) { Fail 'Each comment must include path.' }
  if (Test-IgnoredReviewPath -Path ([string]$comment.path)) {
    Write-Warning "Skipping ignored review path: $($comment.path)"
    continue
  }

  if (-not $comment.line -and -not $comment.position) { Fail "Comment for $($comment.path) must include line or position." }
  if ($comment.line -and -not $comment.side) { Fail "Comment for $($comment.path):$($comment.line) must include side." }
  if (-not $comment.body) { Fail "Comment for $($comment.path) must include body." }

  $normalized = [ordered]@{
    path = [string]$comment.path
    body = [string]$comment.body
  }

  if ($comment.position) {
    $normalized.position = [int]$comment.position
  } else {
    $side = [string]$comment.side
    if ($side -ne 'RIGHT' -and $side -ne 'LEFT') {
      Fail "Comment side must be RIGHT or LEFT: $($comment.path):$($comment.line)"
    }

    $normalized.line = [int]$comment.line
    $normalized.side = $side
  }

  $normalizedComments += $normalized
}

if ($normalizedComments.Count -eq 0) {
  Fail 'No review comments remain after applying ignore path filters.'
}

$defaultReviewBody = @'
## Summary

이 PR의 변경 diff를 기준으로 주요 변경사항을 요약합니다.

## Code Review

버그 가능성, 보안, 유지보수 영향이 있는 항목을 중심으로 인라인 코멘트를 남겼습니다.
'@
$reviewBody = if ($commentsJson.body) { [string]$commentsJson.body } else { $defaultReviewBody }
$payload = [ordered]@{
  commit_id = $headSha
  event = 'COMMENT'
  body = $reviewBody
  comments = $normalizedComments
}

if ($DryRun) {
  Write-Output "Dry run: would post $($normalizedComments.Count) inline review comment(s) to $owner/$repoName PR #$PrNumber at $headSha."
  $payload | ConvertTo-Json -Depth 10
  exit 0
}

try {
  if ($script:GhPath) {
    Invoke-GhApi -Method Post -Endpoint "repos/$owner/$repoName/pulls/$PrNumber/reviews" -Body $payload | Out-Null
  } else {
    Invoke-GitHubApi -Method Post -Uri "https://api.github.com/repos/$owner/$repoName/pulls/$PrNumber/reviews" -Body $payload | Out-Null
  }

  Write-Output "Posted $($normalizedComments.Count) inline review comment(s) to PR #$PrNumber."
  Remove-CommentsFileAfterSuccess
} catch {
  Write-Warning "Bulk review endpoint failed. Retrying as individual inline comments."

  try {
    $posted = 0
    foreach ($comment in $normalizedComments) {
      $commentPayload = [ordered]@{
        commit_id = $headSha
        path = $comment.path
        body = $comment.body
      }

      if ($comment.position) {
        $commentPayload.position = $comment.position
      } else {
        $commentPayload.line = $comment.line
        $commentPayload.side = $comment.side
      }

      if ($script:GhPath) {
        Invoke-GhApi -Method Post -Endpoint "repos/$owner/$repoName/pulls/$PrNumber/comments" -Body $commentPayload | Out-Null
      } else {
        Invoke-GitHubApi -Method Post -Uri "https://api.github.com/repos/$owner/$repoName/pulls/$PrNumber/comments" -Body $commentPayload | Out-Null
      }

      $posted += 1
    }

    Write-Output "Posted $posted individual inline review comment(s) to PR #$PrNumber."
    Remove-CommentsFileAfterSuccess
  } catch {
    Write-Warning "Individual inline comments failed. Posting fallback PR review body."

    $fallbackPayload = [ordered]@{
      event = 'COMMENT'
      body = New-FallbackReviewBody
    }

    if ($script:GhPath) {
      Invoke-GhApi -Method Post -Endpoint "repos/$owner/$repoName/pulls/$PrNumber/reviews" -Body $fallbackPayload | Out-Null
    } else {
      Invoke-GitHubApi -Method Post -Uri "https://api.github.com/repos/$owner/$repoName/pulls/$PrNumber/reviews" -Body $fallbackPayload | Out-Null
    }

    Write-Output "Posted fallback PR review body to PR #$PrNumber."
    Remove-CommentsFileAfterSuccess
  }
}
