/**
 * 사이트 전체가 참조하는 설정값.
 *
 * 요구사항 7.5.3 — 새 알고리즘을 추가할 때 손대는 곳을 줄이기 위해,
 * 알고리즘의 "이름표"는 모두 이 파일에 모아 둔다.
 * (실제 탐색 로직은 3~4단계에서 src/core/ 아래에 알고리즘마다 한 파일씩 추가한다.)
 */

// 목표 상태는 규칙의 일부이므로 코어가 갖고 있다. 화면 쪽은 여기서 가져다 쓴다.
export { GOAL } from '../core/puzzle.js';

/**
 * 난이도별 예제 초기 상태 (요구사항 3.1.1)
 * minMoves는 "최소 몇 번 밀어야 풀리는가"의 참값이다.
 * test/presets.test.js가 너비 우선 탐색으로 이 값을 매번 다시 확인한다.
 */
export const PRESETS = [
  // 탐색 횟수(= 확장한 노드 수, 기본 알고리즘 BFS 기준)를 기준으로 사다리를 짠다.
  // 학습자가 탐색 과정을 처음부터 끝까지 따라갈 수 있도록 짧은 것부터 둔다.
  { id: 'intro',     name: '맛보기', note: '2수 · 탐색 3회',   minMoves: 2,  state: [1, 2, 0, 4, 5, 3, 7, 8, 6] },
  { id: 'easy',      name: '쉬움',   note: '3수 · 탐색 10회',  minMoves: 3,  state: [1, 0, 3, 4, 2, 6, 7, 5, 8] },
  { id: 'normal',    name: '보통',   note: '5수 · 탐색 34회',  minMoves: 5,  state: [4, 1, 3, 0, 2, 6, 7, 5, 8] },
  { id: 'hard',      name: '어려움', note: '8수 · 탐색 154회', minMoves: 8,  state: [0, 5, 2, 1, 8, 3, 4, 7, 6] },
  { id: 'challenge', name: '도전',   note: '31수 · BFS는 포기', minMoves: 31, state: [8, 6, 7, 2, 5, 4, 3, 0, 1] },
];

/** 휴리스틱 (요구사항 3.2.2) */
export const HEURISTICS = [
  { id: 'h0', name: 'h0 · 항상 0',            note: 'A*가 균일 비용 탐색처럼 동작한다' },
  { id: 'h1', name: 'h1 · 제자리에 없는 타일 수', note: '세기 쉬운 대신 정보가 적다' },
  { id: 'h2', name: 'h2 · 맨해튼 거리 합',      note: '더 똑똑해서 A*가 빨라진다' },
];

/**
 * 학습 단계 (요구사항 4번 · 5장)
 * 세 단계는 잠금 없이 자유롭게 오간다 (요구사항 5.4.1).
 */
export const STAGES = [
  {
    id: 'pseudo',
    no: 1,
    name: '의사코드',
    desc: '버튼만 눌러 흐름을 본다',
    ready: false,
  },
  {
    id: 'fill',
    no: 2,
    name: '빈칸 채우기',
    desc: '핵심 한 줄을 채워 본다',
    ready: false,
  },
  {
    id: 'write',
    no: 3,
    name: '직접 작성',
    desc: '파이썬으로 직접 만든다',
    ready: false,
  },
];

/**
 * 알고리즘 목록 (요구사항 3.2)
 *  family    : 'blind' 맹목적 탐색 | 'heuristic' 경험적 탐색
 *  structure : OPEN을 무엇으로 다루는가 — 시각화 모양을 결정한다 (요구사항 4.2.1)
 *  ready     : 탐색 엔진이 구현되었는가 (2단계에서는 모두 false)
 */
export const ALGORITHMS = [
  {
    id: 'bfs', name: '너비 우선 탐색', en: 'Breadth-First Search',
    family: 'blind', structure: 'queue', evalTag: 'depth',
    point: '가장 얕은 것부터 본다 · 최단 경로를 보장한다',
    ready: true,
    // 교과서 성질 (요구사항 3.2) — b: 분기 계수, d: 해의 깊이, m: 최대 깊이, L: 깊이 한계
    props: { complete: '완전함', optimal: '최적 (간선 비용이 같을 때)', time: 'O(b^d)', space: 'O(b^d)' },
  },
  {
    id: 'dfs', name: '깊이 우선 탐색', en: 'Depth-First Search',
    family: 'blind', structure: 'stack', evalTag: 'depth',
    point: '끝까지 파고든다 · 메모리는 적게, 대신 최적해는 보장 못 한다',
    ready: true,
    // 8-퍼즐에서 스택 탐색은 어떤 입력이든 한 갈래로 끝없이 파고든다.
    // 주 화면에서는 그 "파고드는" 모습만 짧게 보여 주고 멈춘다(비교 화면은 전체 사용).
    demoLimit: 60,
    props: { complete: '아님 (무한히 깊어짐)', optimal: '아님', time: 'O(b^m)', space: 'O(b·m)' },
  },
  {
    id: 'dls', name: '깊이 제한 탐색', en: 'Depth-Limited Search',
    family: 'blind', structure: 'stack', evalTag: 'depth',
    point: '깊이에 한계를 두어 무한히 내려가는 것을 막는다',
    ready: true,
    props: { complete: '조건부 (해가 L 이내)', optimal: '아님', time: 'O(b^L)', space: 'O(b·L)' },
  },
  {
    id: 'ids', name: '반복적 깊이 심화 탐색', en: 'Iterative Deepening Search',
    family: 'blind', structure: 'stack', evalTag: 'depth',
    point: '한계를 1씩 늘려가며 반복한다 · BFS의 최단성 + DFS의 적은 메모리',
    ready: true,
    props: { complete: '완전함', optimal: '최적 (간선 비용이 같을 때)', time: 'O(b^d)', space: 'O(b·d)' },
  },
  {
    id: 'hill', name: '언덕 등반', en: 'Hill Climbing',
    family: 'heuristic', structure: 'single', evalTag: 'h', defaultHeuristic: 'h2',
    point: '지금보다 나은 이웃으로만 간다 · 지역 최적에 갇힐 수 있다',
    ready: true,
    props: { complete: '아님 (지역 최적)', optimal: '아님', time: '지역 최적까지', space: 'O(b)' },
  },
  {
    id: 'best', name: '최상 우선 탐색', en: 'Best-First Search',
    family: 'heuristic', structure: 'priority', evalTag: 'h', defaultHeuristic: 'h2',
    point: 'h(n)이 가장 작은 것부터 본다 · 빠르지만 최적은 아니다',
    ready: true,
    props: { complete: '완전함 (중복 제거 시)', optimal: '아님', time: 'O(b^m)', space: 'O(b^m)' },
  },
  {
    id: 'astar', name: 'A* 알고리즘', en: 'A* Search',
    family: 'heuristic', structure: 'priority', evalTag: 'f', defaultHeuristic: 'h2',
    point: 'f(n)=g(n)+h(n) · 조건을 갖추면 최적해를 보장한다',
    ready: true,
    props: { complete: '완전함', optimal: '최적 (허용 가능한 h)', time: 'O(b^d)', space: 'O(b^d)' },
  },
];

/** OPEN을 어떤 모양으로 그릴지 (요구사항 4.2.1) */
export const STRUCTURE_LABEL = {
  queue:    { name: '큐 (FIFO)',        hint: '앞에서 꺼내고 뒤로 넣는다' },
  stack:    { name: '스택 (LIFO)',      hint: '넣은 곳에서 바로 꺼낸다' },
  priority: { name: '우선순위 큐',       hint: '평가값이 작은 것부터 꺼낸다' },
  single:   { name: '현재 노드 하나',    hint: 'OPEN을 두지 않고 지금 노드만 본다' },
};

/**
 * OPEN 자료구조 바꾸기 (핵심 실험 · 요구사항 3.2 · 3.2.3)
 * 학습자가 OPEN을 무엇으로 관리할지 직접 골라 같은 퍼즐이 어떻게 달리 풀리는지 본다.
 * 자료구조 하나가 곧 알고리즘이 된다.
 */
export const STRUCTURE_CHOICES = [
  { id: 'queue',    algo: 'bfs',   name: '큐',        sub: 'FIFO',    becomes: '너비 우선 탐색',
    tip: '먼저 넣은 것을 먼저 꺼낸다 → 얕은 곳부터 훑어 최단 경로를 찾는다' },
  { id: 'stack',    algo: 'dfs',   name: '스택',      sub: 'LIFO',    becomes: '깊이 우선 탐색',
    tip: '마지막에 넣은 것을 먼저 꺼낸다 → 한 갈래를 끝까지 파고든다' },
  { id: 'pq-h',     algo: 'best',  name: '우선순위 큐', sub: 'h',       becomes: '최상 우선 탐색',
    tip: '남은 거리 어림값(h)이 작은 것부터 → 목표로 빠르게 돌진한다' },
  { id: 'pq-f',     algo: 'astar', name: '우선순위 큐', sub: 'f=g+h',   becomes: 'A* 알고리즘',
    tip: '비용+어림값(g+h)이 작은 것부터 → 빠르면서 최단 경로도 보장' },
];

/** 알고리즘 id → 어떤 자료구조 선택으로 만들어지는가 (동기화용) */
export const STRUCTURE_OF_ALGO = Object.fromEntries(STRUCTURE_CHOICES.map((c) => [c.algo, c.id]));

/** 실행 속도 (요구사항 4.3.2) — 한 단계 사이의 밀리초 */
export const SPEEDS = [
  { id: 'slow',   name: '느림', ms: 1200 },
  { id: 'normal', name: '보통', ms: 600  },
  { id: 'fast',   name: '빠름', ms: 200  },
];

/** 안전 장치 (요구사항 4.3.5) */
export const MAX_EXPANSIONS = 25000;
