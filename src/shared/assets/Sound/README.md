# Sound assets

## keypress-sprite.wav

키캡 배틀의 키 소리. 아래 CC0 타이핑 녹음에서 키 한 번 소리 16개를 잘라 하나로 이어 붙인 스프라이트다.

- 원본: grcekh의 Freesound 업로드, HHKB Pro Hybrid(Topre 방식) 타이핑 녹음
  - [Keyboard Typing 2 (HHKB, Topre)](https://freesound.org/people/grcekh/sounds/546033/): 43.2초, 67.9초 지점의 키 소리
  - [Keyboard Typing 3 (HHKB, Topre)](https://freesound.org/people/grcekh/sounds/546043/): 50.6초 지점의 키 소리
  - [Keyboard Typing 6 (HHKB, Topre)](https://freesound.org/people/grcekh/sounds/546088/): 13.8초 지점의 키 소리
  - [Keyboard Typing 7 (HHKB, Topre)](https://freesound.org/people/grcekh/sounds/546164/): 1.1초, 9.4초, 11.8초, 28.2초, 36.6초, 62.4초 지점의 키 소리
  - [Keyboard Typing 8 (HHKB, Topre)](https://freesound.org/people/grcekh/sounds/546165/): 0.1초, 18.6초, 78.0초, 87.4초, 88.6초, 96.9초 지점의 키 소리
- 라이선스: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (출처 표기 의무 없음, 기록 목적으로 남긴다). 각 페이지에 "CC0 - Feel free to use for anything!"로 표기되어 있다.
- 원본 형식: Freesound는 원본 파일을 로그인해야 받을 수 있어 공개된 고음질 미리듣기(mp3)를 썼다.
- 선택 기준: 앞 0.1초와 뒤 0.17초 안에 다른 키 소리가 없는 깨끗한 소리 중 꼬리 소리가 작은 것 16개
- 가공: 소리가 시작되는 지점 10ms 앞부터 180ms를 잘라 마지막 30ms를 페이드아웃하고, 피크를 0.85로 맞춘 뒤
  순서대로 이어 붙여 32kHz 모노 16bit WAV로 저장했다.
- 구성: 한 칸이 0.18초이고 16칸이다. 재생 코드는 `src/shared/lib/sound/sounds.ts`의 `KEY_SPRITE_*`
  상수를 쓴다. 칸 수나 길이를 바꾸면 그 상수도 함께 바꾼다.
- 음색: Topre 방식이라 깊고 둥글게 울리는 소리(요즘 말하는 "thock")에 가깝다. 이전에 쓴 사무용 키보드(Cherry KC 1000)
  녹음보다 800Hz 이하 저음 비율이 높다.

## keypress-tok-sprite.wav

티키타닥의 "또각" 모드 키 소리. 기계식 키보드를 천천히 한 키씩 누른 CC0 녹음에서, 한 번 누르고 떼는 한 쌍을
통째로 잘라 이어 붙인 스프라이트다.

- 원본: [Mechanical keyboard typing (slow, individual keys)](https://freesound.org/people/mccreery/sounds/509171/) — mccreery
- 라이선스: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (출처 표기 의무 없음, 기록 목적으로 남긴다)
- 원본 형식: 원본 파일은 로그인해야 받을 수 있어 공개 미리듣기(mp3)를 썼다.
- 선택 기준: 앞뒤로 다른 키 소리가 섞이지 않은 한 번의 키 입력 5개 (원본 0.98초, 3.08초, 4.97초, 5.50초, 8.08초 지점)
- 가공: 소리가 시작되는 지점 10ms 앞부터 260ms를 잘라 마지막 50ms를 페이드아웃하고, 피크를 0.85로 맞춰 이어 붙인 뒤
  32kHz 모노 16bit WAV로 저장했다.
- 구성: 한 칸이 0.26초이고 5칸이다. 재생 코드는 `src/shared/lib/sound/sounds.ts`의 `CLACKY_SPRITE`를 쓴다.
- 음색: 위의 HHKB 녹음보다 2kHz 이상 고음 비율이 훨씬 높아 딱딱하고 또렷한 "또각" 소리에 가깝다.
- 한계: 쓸 수 있는 깨끗한 키 입력이 5개뿐이라 소리 종류가 적다. 재생할 때마다 음높이와 크기를 조금씩 바꿔
  반복되는 느낌을 줄였다. 더 필요하면 같은 방식으로 직접 녹음하거나 다른 CC0 녹음을 이어 붙인다.

## bgm-flowerbed-fields.mp3

티키 날기의 배경음악. 귀여운 칩튠 반복곡이라 끝과 처음이 이어지도록 만들어진 곡이다.

- 원본: [Flowerbed Fields [Loop]](https://opengameart.org/content/flowerbed-fields-loop) — Zane Little Music (OpenGameArt)
- 라이선스: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (출처 표기 의무 없음, 기록 목적으로 남긴다). 페이지에 CC0로 표기되어 있다.
- 가공: 원본 OGG(약 106초, 44.1kHz 스테레오)를 32kHz 모노 MP3(56kbps)로 줄였다. 용량은 약 740KB다.
  Safari는 OGG를 디코딩하지 못하는 버전이 있어 MP3로 바꿨다.
- 재생: `src/shared/lib/sound/bgm.ts`가 Web Audio로 반복 재생한다. MP3는 앞뒤에 아주 짧은 무음이 생길 수 있어,
  이음새가 거슬리면 원본 WAV를 쓰거나 반복 구간을 조절한다.

## bgm-happy-clappy.mp3

탁 잡기의 배경음악. 밝고 경쾌한 피아노 반복곡이다. 처음에 쓴 8비트 곡(The Arplands)은 탁 잡기와 어울리지 않아 바꿨다.

- 원본: [Happy Clappy Loop](https://opengameart.org/content/happy-clappy-loop) — OwlishMedia (OpenGameArt). 애니메이션 단편 "Cat's Sky"의 곡을 게임 반복용으로 고친 것이다.
- 라이선스: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (출처 표기 의무 없음, 기록 목적으로 남긴다). 페이지에 CC0로 표기되어 있다.
- 가공: 원본 WAV(17초, 44.1kHz 스테레오 32bit float)를 32kHz 모노 MP3(64kbps)로 줄였다. 용량은 약 140KB다.
  설명에 "Loops seamlessly"라고 되어 있어 그대로 반복한다.
- 음량: 티키 날기 곡보다 약 3dB 작아서(−22.4 vs −19.3 LUFS) 재생 볼륨을 조금 더 높게 잡았다(`WhackGamePage.tsx`).
- 재생: `src/shared/lib/sound/bgm.ts`와 `src/shared/hooks/useGameBgm.ts`. 티키 날기 곡과 같은 방식이다.

## sting-impossible.mp3

티키타닥에서 초고수를 이긴 뒤 "불가능 도전" 선택 화면이 나올 때 내는 긴장감 있는 효과음(8초). 무섭지 않고 통통 튀는 8비트 보스 곡이다.
처음에 쓴 오케스트라 보스 곡(Sinister Boss Appears)은 너무 무서워서 바꿨다.

- 원본: [Boss Fight Bounce](https://opengameart.org/content/boss-fight-bounce) — Locomule (OpenGameArt), BeepBox로 만든 칩튠. "긴장감이 많은 경쾌한 보스전 배경음악"이라고 소개돼 있다.
- 라이선스: 페이지에 GPL 3.0과 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)이 함께 표기돼 있다. 둘 중 CC0로 쓴다(출처 표기 의무 없음, 기록 목적으로 남긴다).
- 가공: 원본 MP3(72초)의 처음 8초만 잘라 음을 약 2반음 올리고(재생 속도 1.12배로 한 번에 처리), 5.5kHz 이상의 날카로운 소리를 깎고, 앞 0.6초 페이드인, 마지막 2초 페이드아웃을 걸어 44.1kHz 모노 MP3(128kbps)로 저장했다. 용량은 약 130KB다.
  처음에는 32kHz 64kbps로 줄이고 재생할 때 속도·필터를 더 걸었더니 칩튠 소리가 깨져 들려서, 높은 품질로 한 번만 가공하는 방식으로 바꿨다.
- 선택 기준: 칩튠이라 귀엽고, 설명이 "긴장감 있고 경쾌함"이다. 직접 들어 보고 고른 것은 아니다.
- 대안(모두 CC0): [Suspicious Loop](https://opengameart.org/content/suspicious-loop), [It Lies ahead!](https://opengameart.org/content/it-lies-ahead)
- 재생: `src/shared/lib/sound/sounds.ts`의 `impossible`. 파일을 아직 못 불러왔으면 같은 이름의 합성음(약 3초)으로 대신한다.
