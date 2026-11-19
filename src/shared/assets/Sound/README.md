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
