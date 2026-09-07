/**
 * 레슨(단계별 페이지) — 상단 큰 탭 네 개(자료구조·탐색 기초·알고리즘·정리)마다 쪽 묶음이 다르다.
 *
 * 원칙
 *  - 한 쪽 = 배울 것 하나. 화면에는 그 하나에 필요한 것만 켠다(혼란 방지).
 *  - goal(배울 것) 문장 안에 "왜 배우나(이유)"를 함께 녹인다.
 *  - 알고리즘 탭은 알고리즘마다 같은 4쪽 템플릿을 쓰고, 내용은 고른 알고리즘(algoTab)으로 갈린다.
 *
 * layout : 화면 배치 이름 (styles/layout.css의 .workspace[data-layout=...])
 * stage  : 코드 패널 모드 (pseudo | fill | write)
 * show   : 이 페이지에서 켤 조각들
 * algo   : 이 쪽에서 데모에 쓸 알고리즘을 고정(기초 탭 전용). main.js가 적용.
 */
import { DS_LESSON } from './dsLesson.js';

/* ══════════════════════════ 탐색 기초 (basics) ══════════════════════════ */
export const BASICS = [
  {
    id: 'intro',
    title: '8-퍼즐과 상태(state)',
    goal: '숫자 칸을 밀어 목표와 똑같이 만들면 끝나요. 이런 배치 하나하나를 "상태(state)"라고 불러요. 이렇게 이름을 붙여야 컴퓨터가 "지금 어디에 있는지"를 다룰 수 있기 때문이에요.',
    todo: '타일을 눌러 직접 밀어 보세요! 빈칸 옆 타일만 움직여요. 이렇게 상태를 바꾸는 규칙을 "연산자"라고 해요.',
    layout: 'board', stage: 'pseudo',
    show: { board: true, play: true },
  },
  {
    id: 'space',
    title: '탐색이 진행되는 방식',
    goal: '한 상태에서 빈칸을 밀면 여러 이웃 상태가 생기고, 그 이웃도 또 이웃을 낳아 거대한 그물이 돼요(상태공간). 이 그물에서 시작 → 목표까지 길을 찾는 일이 "탐색"이에요. 컴퓨터는 이렇게 진행해요 → ① 살펴볼 후보 하나를 꺼낸다 → ② 목표인지 확인한다 → ③ 목표가 아니면 그 이웃(자식)을 만들어 후보에 더한다 → ④ 목표를 찾을 때까지 ①~③을 되풀이한다. 다음 쪽부터 이 네 단계를 하나씩 자세히 배워요.',
    todo: '아래 "이웃 상태" 띠를 보세요 — 한 배치에서 갈 수 있는 이 후보들이 위 ③에서 후보 목록에 더해질 것들이에요. 이 갈래가 계속 이어진다고 상상해 보세요.',
    layout: 'board', stage: 'pseudo', algo: 'bfs',
    show: { board: true, children: true },
  },
  {
    id: 'expand',
    title: '노드와 확장(expand)',
    goal: '탐색이 다루는 상태 하나하나를 "노드(node)"라고 해요. 노드를 하나 골라 거기서 만들 수 있는 다음 배치를 모두 만드는 일이 "확장"이에요. 컴퓨터는 한 번에 노드 하나씩만 확장해 조금씩 넓혀 가기 때문에, 이 "확장"이 탐색의 기본 동작이 돼요.',
    todo: '⏭ 한 단계를 눌러 노드를 한 번 확장해 보세요. 아래 "자식 노드" 띠에 다음 배치가 만들어져요. 빈칸 위치에 따라 자식이 2·3·4개로 달라지는 것도 세어 보세요.',
    layout: 'board', stage: 'pseudo', algo: 'bfs',
    show: { board: true, action: true, controls: true, children: true },
  },
  {
    id: 'open',
    title: 'OPEN — 다음에 볼 노드',
    goal: '확장할 차례를 기다리는 노드를 모아 두는 곳이 OPEN 리스트예요. 다음에 무엇을 확장할지 기억해 두지 않으면 탐색을 이어 갈 수 없기 때문에, 만든 자식은 OPEN에 넣고(push) 확장할 때 꺼내요(pop).',
    todo: '한 단계씩 누르면서 OPEN이 자식이 생길 때 늘고(push), 하나 꺼낼 때 주는(pop) 것을 보세요. (CLOSED는 다음 쪽에서 배워요.)',
    layout: 'board-data', stage: 'pseudo', algo: 'bfs',
    show: { board: true, action: true, controls: true, open: true, slim: true },
  },
  {
    id: 'closed',
    title: 'CLOSED — 이미 본 노드',
    goal: '확장을 마친 노드는 CLOSED로 옮겨 "이미 봤다"고 표시해요. 이렇게 표시해 두지 않으면 같은 배치를 끝없이 다시 확장해 제자리를 맴돌기 때문이에요(무한 반복 방지·낭비 방지).',
    todo: '한 단계씩 누르면서, OPEN에서 꺼낸 노드가 CLOSED 상자로 옮겨져 쌓이는 것을 보세요. 방금 옮겨진 노드는 주황색이에요.',
    layout: 'board-data', stage: 'pseudo', algo: 'bfs',
    show: { board: true, action: true, controls: true, open: true, closed: true, slim: true },
  },
  {
    id: 'flow',
    title: '순서도로 흐름 읽기',
    goal: '지금까지 눈으로 본 절차를 그림으로 적은 것이 순서도예요. 판단(◇)과 처리(□)와 되돌이 화살표가 왜 이 자리에 있는지 알면, 어떤 탐색이든 순서도만 보고 흐름을 읽을 수 있어요. 모든 탐색이 이 뼈대를 함께 씁니다.',
    todo: '한 단계씩 누르면 지금 실행 중인 도형이 강조돼요. 아래 "왜 이 모양인가" 설명과 맞춰 보며, 판단 두 개(비었나?·목표인가?)와 되돌이 화살표의 뜻을 확인하세요.',
    layout: 'code-board', stage: 'pseudo', algo: 'bfs',
    show: { code: true, flowwhy: true, board: true, controls: true },
  },
  {
    id: 'heuristic',
    title: '휴리스틱과 평가함수',
    goal: '목표까지 얼마나 남았는지 "어림잡은 값"이 휴리스틱 h(n)이에요. 아직 안 가 봤어도 대략 재 보면, 목표에 가까워 보이는 노드부터 살펴 더 똑똑하게 탐색할 수 있어요. 최상우선은 h만, A*는 평가함수 f = g + h(온 비용 + 어림값)를 씁니다.',
    todo: '지금 배치에서 세 가지 어림 방법(0 · 제자리 아닌 타일 수 · 맨해튼 거리 합)의 값이 얼마나 다른지 보세요. g·h·f가 어떻게 계산되는지도 확인하세요.',
    layout: 'board-data', stage: 'pseudo', algo: 'astar',
    show: { board: true, heuristic: true },
  },
];

/* ══════════════════════════ 알고리즘 (algo) ══════════════════════════ */
/**
 * 알고리즘 하위 탭마다 같은 4쪽 템플릿을 쓴다. 쪽 내용(설명)은 고른 알고리즘에 따라 갈린다.
 * ALGO_INFO에 알고리즘별 설명 문구를 모아 두고, algoPages()가 4쪽으로 조립한다.
 */
const ALGO_INFO = {
  bfs: {
    label: '너비 우선 탐색(BFS)',
    solveGoal: 'OPEN을 큐(먼저 넣은 것을 먼저 꺼냄)로 쓰면 얕은 곳부터 빠짐없이 훑어요. 그래서 처음 만나는 해가 곧 가장 짧은 해예요 — 최단 경로가 필요할 때 큐를 쓰는 이유죠. 대신 OPEN이 크게 부풀어 메모리를 많이 써요.',
    solveTodo: '▶ 재생(또는 ⏭ 한 단계)으로 진행하며 [탐색 트리] 탭에서 트리가 "층층이 넓게" 자라는 것을 보세요. 카운터의 OPEN 최대 크기가 얼마나 커지나요?',
  },
  dfs: {
    label: '깊이 우선 탐색(DFS)',
    solveGoal: 'OPEN을 스택(마지막에 넣은 것을 먼저 꺼냄)으로 바꾸면 한 갈래로 깊이 파고들어요. OPEN이 얇게 유지돼 메모리는 적게 쓰지만, 처음 찾은 해가 가장 짧다는 보장이 없어요. 8-퍼즐에선 길을 잃고 헤매서, 깊이 제한이 왜 필요한지 몸으로 느끼게 돼요.',
    solveTodo: '진행하며 [탐색 트리] 탭에서 트리가 "한 줄로 깊게" 내려가는 것을 BFS와 비교해 보세요. 난이도를 바꾸면 파고드는 길이도 달라져요.',
  },
  best: {
    label: '최상 우선 탐색',
    solveGoal: '기초에서 배운 휴리스틱 h(남은 거리 어림값)가 가장 작은 노드부터 꺼내요. "지금 목표에 가장 가까워 보이는" 것부터 보니 목표로 빠르게 돌진하지만, 여기까지 온 비용(g)을 무시해서 최단 경로는 보장하지 못해요.',
    solveTodo: '진행하며 OPEN 항목의 h 값을 보세요. 오른쪽 끝(h가 가장 작은 것)이 다음에 나가죠? A*와 견주면 "빠르지만 최단은 아님"이 보여요.',
  },
  astar: {
    label: 'A* 탐색',
    solveGoal: '평가함수 f = g + h(온 비용 + 남은 어림값)가 가장 작은 노드부터 꺼내요. g까지 함께 보므로, 빠르면서도 최단 경로를 놓치지 않아요(허용적 휴리스틱이면 최단 보장) — 그래서 길찾기에 가장 많이 쓰여요.',
    solveTodo: '진행하며 OPEN 항목의 f 값을 보세요. 최상우선·BFS·DFS보다 확장 노드 수가 훨씬 적은 것을 카운터에서 확인하세요.',
  },
  hill: {
    label: '언덕 등반',
    solveGoal: 'OPEN을 두지 않고 "지금 상태"의 이웃만 보고, h가 가장 작은 이웃으로 한 걸음씩 옮겨요. 빠르지만, 더 나은 이웃이 없으면 목표가 아니어도 멈춰요(지역 최적). 그 "막힘"을 눈으로 보는 것이 이 알고리즘의 교훈이에요.',
    solveTodo: '진행하며 이웃 후보들의 h를 보세요. 가장 작은 이웃으로 옮겨 가다가, 더 나아지지 않아 멈추는 순간을 확인하세요(어려운 배치일수록 잘 막혀요).',
  },
};

const ALGO_PAGE_META = [
  {
    id: 'solve', badge: '①', name: '어떻게 8퍼즐을 푸나',
    layout: 'board-data',
    show: { board: true, action: true, controls: true, open: true, closed: true, tree: true, slim: true },
  },
  {
    id: 'pseudo', badge: '②', name: '의사코드 읽기',
    goal: '이 알고리즘을 말과 코드 중간쯤으로 적은 것이 의사코드예요. 각 줄이 무슨 일을 하고 왜 필요한지 한 줄씩 읽어 두면, 다음 쪽에서 코드가 어떻게 움직이는지 이해할 수 있어요.',
    todo: '한 단계씩 누르면 지금 실행 중인 줄이 강조돼요. 오른쪽 설명으로 그 줄이 하는 일을 확인하고, 특히 "꺼내는 줄"이 이 알고리즘의 성격을 정한다는 점에 주목하세요.',
    layout: 'code-board',
    show: { code: true, coderead: true, board: true, controls: true },
  },
  {
    id: 'trace', badge: '③', name: '줄별 동작을 이미지로',
    goal: '의사코드 한 줄이 실제로 무엇을 바꾸는지 이미지로 봐요. 한 단계 밟을 때마다 지금 실행 중인 줄과, 그 줄이 바꾸는 퍼즐 판·OPEN·CLOSED가 함께 움직여요. "코드 한 줄 = 화면의 어떤 변화"를 눈으로 잇는 쪽이에요.',
    todo: '⏭ 한 단계씩 천천히 눌러 보세요. 왼쪽 줄이 강조되는 순간, 오른쪽에서 무엇이 움직이는지(타일이 밀리고, 노드가 관에서 빠지고, CLOSED에 쌓이고) 짝지어 확인하세요.',
    layout: 'code-board-data',
    show: { code: true, coderead: true, board: true, action: true, controls: true, open: true, closed: true, slim: true },
  },
  {
    id: 'python', badge: '④', name: '의사코드 ↔ 파이썬',
    goal: '의사코드 한 줄이 어떤 파이썬 코드가 되는지 나란히 맞춰 봐요. 파이썬을 몰라도 괜찮아요 — 한 단계 밟으면 양쪽에서 같은 줄이 켜지고, 그 줄이 판·OPEN을 어떻게 바꾸는지 함께 움직여요. 성격을 정하는 핵심 한 줄만 바꿔 차이도 관찰해요.',
    todo: '한 단계씩 밟으며 의사코드↔파이썬이 같은 일을 하는 걸 확인하세요. 아래 드롭다운으로 "핵심 한 줄"을 바꾸면 결과가 어떻게 달라지는지 보세요.',
    layout: 'code-board-data',
    show: { code: true, pymap: true, board: true, action: true, controls: true, open: true, slim: true },
  },
];

let _algoCache = { id: null, pages: null };
function algoPages(algoId) {
  if (_algoCache.id === algoId) return _algoCache.pages;
  const info = ALGO_INFO[algoId] || ALGO_INFO.bfs;
  const pages = ALGO_PAGE_META.map((m) => ({
    id: m.id,
    title: `${m.badge} ${info.label} — ${m.name}`,
    goal: m.id === 'solve' ? info.solveGoal : m.goal,
    todo: m.id === 'solve' ? info.solveTodo : m.todo,
    layout: m.layout,
    stage: 'pseudo',
    show: m.show,
  }));
  _algoCache = { id: algoId, pages };
  return pages;
}

/** 알고리즘 하위 탭 목록(순서 = 맹목적 → 경험적 → 국소). topbar가 칩으로 그린다. */
export const ALGO_TABS = [
  { id: 'bfs',   name: '너비 BFS' },
  { id: 'dfs',   name: '깊이 DFS' },
  { id: 'best',  name: '최상우선' },
  { id: 'astar', name: 'A*' },
  { id: 'hill',  name: '언덕등반' },
];

/* ══════════════════════════ 정리·확인 (wrap) ══════════════════════════ */
export const WRAP = [
  {
    id: 'summary',
    title: '오늘 배운 것 정리',
    goal: '상태·노드·확장·OPEN·CLOSED에서 시작해, 자료구조 하나가 알고리즘을 정하고, 그것이 순서도·의사코드·파이썬으로 같은 절차라는 것까지 왔어요.',
    todo: '아래 표로 배운 것을 되짚고, ⚖ 비교와 📖 용어로 한 번 더 확인해 보세요. 표의 줄을 누르면 그 알고리즘 탭으로 갑니다.',
    layout: 'code', stage: 'pseudo',
    show: { code: true, summary: true },
  },
  {
    id: 'quiz',
    title: '이해 확인',
    goal: '배운 것을 스스로 확인해 봐요. 자료구조와 알고리즘이 어떻게 이어지는지, 휴리스틱이 무슨 뜻인지 문제로 되짚어요.',
    todo: '문제마다 답을 골라 보세요. 바로 정답과 이유를 알려 줍니다. 틀려도 괜찮아요 — 다시 생각해 보면 돼요.',
    layout: 'code', stage: 'pseudo',
    show: { code: true, quiz: true },
  },
];

/* ══════════════════════════ 조회 도우미 ══════════════════════════ */

function clampIndex(i, len) { return Math.max(0, Math.min(len - 1, i | 0)); }

/**
 * 지금 상단 탭에서 쓸 쪽 묶음과 위치를 돌려준다. (진행 막대·레이아웃 이펙트가 함께 쓴다)
 * 알고리즘 탭은 고른 알고리즘(algoTab)으로 4쪽을 조립한다.
 */
export function currentLesson(state) {
  switch (state.mode) {
    case 'ds':
      return { steps: DS_LESSON, index: clampIndex(state.dsStep, DS_LESSON.length), key: 'dsStep' };
    case 'algo': {
      const steps = algoPages(state.algoTab || 'bfs');
      return { steps, index: clampIndex(state.algoStep, steps.length), key: 'algoStep' };
    }
    case 'wrap':
      return { steps: WRAP, index: clampIndex(state.wrapStep, WRAP.length), key: 'wrapStep' };
    case 'basics':
    default:
      return { steps: BASICS, index: clampIndex(state.basicsStep, BASICS.length), key: 'basicsStep' };
  }
}

/** 지금 활성 쪽 객체 — 패널들이 "이 쪽에서 무엇을 켤지(show)"를 볼 때 쓴다.
 *  자료구조 탭(DS_LESSON)의 쪽은 show가 없으므로, 워크스페이스 패널이 안전하게 읽도록 빈 show를 채워 준다. */
export function currentStep(state) {
  const { steps, index } = currentLesson(state);
  const step = steps[index] || {};
  return step.show ? step : { ...step, show: {} };
}
