# 캐릭터 녹음 반응

터치 반응은 캐릭터별 일본어 녹음 3개씩, 총 12개를 먼저 재생한 다음 기존 요청 대사 중 녹음이 없는 항목도 순환합니다. `dist/voice-clips.js`에 말풍선과 파일을 함께 지정했습니다. 감탄사 표기는 비언어적 소리의 근사 표기입니다. 녹음이 없는 요청 대사·상황별 반응이나 파일 재생 오류에는 기존 기기 음성 합성을 사용합니다.

원본 영상 전체는 배포하지 않습니다. 필요한 짧은 구간만 잘라 모노 MP3로 저장하고 음량과 양 끝을 정리했습니다. 원본 URL과 구간은 `dist/assets/voices/reactions/sources.json`에 기록했습니다.

## 사용한 일본어 자료

- 치이카와: [공식 제1화](https://www.youtube.com/watch?v=pbQQAwSQUX4), [사용자가 제공한 한일 비교 영상의 일본어 구간](https://www.youtube.com/watch?v=FtVvbHdiabw).
- 하치와레: [일본어 대사 모음](https://www.youtube.com/watch?v=EfQmbiX1-OM), [なんとかなれーッ 장면](https://www.youtube.com/watch?v=Wy7y5umGTb8).
- 우사기: [사용자가 제공한 짧은 모음집](https://www.youtube.com/watch?v=jgYVHsjXrIA).
- 모몽가: [일본어 대사 모음](https://www.youtube.com/watch?v=esd0x2Ai7J8).

## 추가로 확인한 참고 자료

사용자 메시지의 Instagram 표시 링크는 실제 연결 주소인 [SmBnKMEQYpk](https://www.youtube.com/shorts/SmBnKMEQYpk)로 확인했습니다. 이 영상과 [QOZCVaW5xZc](https://www.youtube.com/shorts/QOZCVaW5xZc)는 한국어 치이카와 대사 모음입니다. [eawkmcE69gk](https://www.youtube.com/watch?v=eawkmcE69gk)는 다른 우사기 모음이며, [8_4cxxBOATc](https://www.youtube.com/watch?v=8_4cxxBOATc)는 한국어 모몽가 음성입니다. 기본 터치에는 확보한 일본어 구간을 우선 사용합니다.
