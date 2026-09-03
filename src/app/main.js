/**
 * 진입점 — 화면 부품을 붙이고, 재생기를 만들어 탐색을 화면에 연결한다.
 *
 * 개발 5단계: 단계 기록(trace)을 실제로 보이게 한다.
 * 학습 2·3단계(빈칸 채우기·직접 작성)는 이후 단계에서 이 위에 얹는다.
 */
import { createStore, findById } from './state.js';
import { ALGORITHMS } from './config.js';
import { createPlayer } from './player.js';
import { createComparePanel } from '../ui/comparePanel.js';
import { createOnboarding } from '../ui/onboarding.js';
import { createGlossaryPanel } from '../ui/glossaryPanel.js';
import { qs } from '../ui/dom.js';
import { mountTopbar } from '../ui/topbar.js';
import { mountLessonBar } from '../ui/lessonBar.js';
import { mountActionCard } from '../ui/actionCard.js';
import { lessonAt } from './lesson.js';
import { mountBoardPanel } from '../ui/boardPanel.js';
import { mountCodePanel } from '../ui/codePanel.js';
import { mountDataPanel } from '../ui/dataPanel.js';
import { mountControls } from '../ui/controls.js';
import { mountDsRoom } from '../ui/dsRoom.js';
import { createCoach } from '../ui/coach.js';

const store = createStore();
const player = createPlayer(store);
const compare = createComparePanel(store, player);
const onboarding = createOnboarding(store);
const glossary = createGlossaryPanel();

mountTopbar(qs('#topbar'), store, compare.open, onboarding.open, glossary.open);
mountLessonBar(qs('#lessonbar'), store);
mountActionCard(qs('#actionbar'), store, player);
mountCodePanel(qs('#panel-code'), store, player, { onCompare: compare.open, onGlossary: glossary.open });
mountBoardPanel(qs('#panel-board'), store, player);
mountDataPanel(qs('#panel-data'), store, player);
mountControls(qs('#controlbar'), store, player);
mountDsRoom(qs('#dsroom'), store);

// 예측 퀴즈(학습 1단계 전용) — 코드 패널의 탭과 코드 사이에 끼워 둔다.
// 코드 패널은 다시 그릴 때 body만 갈아 끼우므로 이 요소는 지워지지 않는다.
const codeRoot = qs('#panel-code');
codeRoot.insertBefore(createCoach(store, player), codeRoot.querySelector('.panel__body'));

// 어느 탭인가 — 탐색 배우기 / 자료구조 배우기 (요청: 자료구조도 따로 배울 수 있게)
store.subscribe((state) => {
  const ds = state.mode === 'ds';
  document.body.classList.toggle('mode-ds', ds);
  if (ds) player.pause();   // 안 보이는 화면이 혼자 재생되지 않게
});

// 레슨 페이지가 바뀌면 화면 배치와 코드 모드를 그 페이지에 맞춘다.
// (한 화면에 필요한 것만 보이게 — 학습 집중)
let lastLesson = -1;
let lastLessonMode = null;
store.subscribe((state) => {
  if (state.mode === 'ds') { lastLessonMode = state.mode; return; }
  if (state.lessonStep === lastLesson && lastLessonMode === state.mode) return;
  lastLesson = state.lessonStep;
  lastLessonMode = state.mode;
  const step = lessonAt(state.lessonStep);
  qs('#workspace').dataset.layout = step.layout;
  const body = document.body;
  for (const key of ['board', 'action', 'controls', 'open', 'tree', 'picker', 'code', 'slim', 'play', 'children', 'summary', 'codemap']) {
    body.classList.toggle(`show-${key}`, Boolean(step.show[key]));
  }
  if (state.stageId !== step.stage) store.set({ stageId: step.stage });
});

// 보기 설정을 문서 뿌리에 반영한다 (요구사항 6.2.2 · 6.3.3)
store.subscribe((state) => {
  const root = document.documentElement;
  if (state.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', state.theme);
  root.style.setProperty('--scale', String(state.scale));
});

// 탐색에 영향을 주는 값(알고리즘·초기 상태·휴리스틱)이 바뀌면 다시 싣는다.
// 그 밖의 값(테마·속도·탭·학습 단계)이 바뀔 때는 진행 위치를 지키려 다시 싣지 않는다.
// (요구사항 5.4.2 — 단계를 바꿔도 알고리즘과 초기 상태는 유지된다)
let lastKey = '';
let lastStage = '';
let lastAlgo = '';
store.subscribe((state) => {
  // 알고리즘을 바꾸면 그 알고리즘이 흔히 쓰는 기본 휴리스틱을 자동으로 고른다.
  // (요청 ③ — 학생이 매번 휴리스틱을 고르지 않아도 되게)
  if (state.algorithmId !== lastAlgo) {
    lastAlgo = state.algorithmId;
    const algo = findById(ALGORITHMS, state.algorithmId);
    if (algo.defaultHeuristic && state.heuristicId !== algo.defaultHeuristic) {
      store.set({ heuristicId: algo.defaultHeuristic });   // 다시 이 구독자를 부르며 새 휴리스틱으로 리로드
      return;
    }
  }

  // 학습 3단계(직접 작성)에서는 학생 코드의 결과를 writePanel이 직접 싣는다.
  if (state.stageId === 'write') {
    if (lastStage !== 'write') { lastStage = 'write'; player.clear(); }
    return;
  }
  const key = `${state.algorithmId}|${state.presetId}|${state.heuristicId}`;
  if (key !== lastKey || lastStage === 'write') {
    lastKey = key;
    player.load();
  }
  lastStage = state.stageId;
});

// 첫 화면에서 바로 탐색을 실어 둔다 — ▶ 재생을 누르면 곧장 움직인다.
player.load();

// 처음 방문한 학습자에게 3단계 안내를 보여 준다 (요구사항 6.1.6)
onboarding.maybeShow();

// 개발 중 확인용
globalThis.__puzzle8 = { store, player };
