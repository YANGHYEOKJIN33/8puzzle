# 구조 안내 (개발자용)

빌드 도구·프레임워크 없이 **브라우저가 바로 읽는 HTML + CSS + ES 모듈**로 만든다.
`index.html`을 열면 그대로 동작하므로, GitHub Pages에 파일을 올리는 것만으로 게시된다
(요구사항 7.1 · 7.2).

## 폴더

```
index.html              화면 뼈대 — 빈 패널만 두고 내용은 JS가 채운다
.nojekyll               GitHub Pages가 파일을 그대로 올리도록
src/
  styles/
    tokens.css          색·간격·글꼴 토큰 (다크 모드, 글자 크기 배율)
    base.css            초기화와 공통 요소
    layout.css          화면 배치 (데스크톱 3분할 / 좁은 화면 1열)
    components.css      패널·퍼즐 판·코드 뷰·카운터 등 부품
  app/
    config.js           알고리즘 목록, 학습 단계, 휴리스틱, 예제 상태
    state.js            앱 상태 저장소 (구독 방식 + 로컬 저장)
    main.js             진입점 — 부품을 붙인다
  ui/
    dom.js              el() / fill() / qs() 만 있는 작은 도우미
    topbar.js           알고리즘 선택 · 테마 · 글자 크기
    stagebar.js         학습 단계 1/2/3 전환
    boardPanel.js       8-퍼즐 판 그리기
    codePanel.js        순서도 / 의사코드 / 파이썬 탭
    dataPanel.js        OPEN·CLOSED·카운터
    controls.js         재생·한 단계·되감기 + 키보드 단축키
  core/                 탐색 엔진 (3~4단계에서 채움, README.md 참고)
docs/                   개발 문서
```

## 두 갈래의 흐름

```
   [ 학생 조작 ]
        │  store.set({ ... })
        ▼
   ┌──────────┐  구독  ┌───────────────┐
   │  state   │ ─────▶ │ ui/*.js 다시 그림 │
   └──────────┘        └───────────────┘
        ▲
        │  탐색 결과(단계 기록 목록)
   ┌──────────┐
   │  core/*  │  ← DOM을 전혀 모른다
   └──────────┘
```

핵심 규칙 하나: **`src/core/`는 화면을 모른다.**
알고리즘은 "한 단계씩 무슨 일이 있었는지"를 기록한 목록만 만들고,
그 목록을 앞뒤로 오가며 그리는 일은 `src/ui/`가 맡는다.
덕분에 되감기(요구사항 4.3.1)가 목록의 인덱스를 하나 줄이는 일이 된다.

## 상태 저장소 사용법

```js
import { createStore } from './app/state.js';

const store = createStore();

store.get();                       // 지금 상태 읽기
store.set({ algorithmId: 'astar' }); // 바뀐 것만 넘긴다
store.subscribe((state) => { ... }); // 구독 즉시 한 번 호출된다
```

`algorithmId` · `stageId` · `heuristicId` · `presetId` · `speedId` · `theme` · `scale`은
브라우저에 자동 저장되어 새로 고쳐도 남는다 (요구사항 5.3.6).

## 알고리즘을 추가할 때 (요구사항 7.5.3)

1. `src/app/config.js`의 `ALGORITHMS`에 항목 하나를 추가한다.
2. `src/core/algorithms/<id>.js`에 탐색 로직 한 파일을 추가한다.
3. 의사코드·파이썬·순서도 원문을 콘텐츠 파일에 추가한다.

화면 코드는 고치지 않는다.

## 개발 중 미리 보기

정적 파일이므로 아무 정적 서버나 쓰면 된다. (ES 모듈이라 `file://`로는 열리지 않는다.)

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```
