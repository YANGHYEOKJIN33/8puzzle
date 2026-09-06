/**
 * 레슨(단계별 페이지) — 한 화면에 딱 필요한 것만 보여 주고, 하나씩 넘어간다.
 *
 * 왜 이렇게 하나요?
 *   한 화면에 많은 것이 있으면 처음 배우는 학생은 어디를 봐야 할지 모릅니다.
 *   그래서 페이지를 나누고, 페이지마다 "이번에 배울 것" 한 가지만 둡니다.
 *
 * 말은 되도록 쉽게 씁니다(초등학생도 읽을 수 있게).
 *   노드 → 배치,  OPEN → 대기 목록,  확장 → 펼치기
 *
 * layout : 화면 배치 이름 (styles/layout.css의 .workspace[data-layout=...])
 * stage  : 코드 패널이 어떤 모드로 그려질지 (pseudo | fill | write)
 * show   : 이 페이지에서 보여 줄 조각들
 */
import { DS_LESSON } from './dsLesson.js';

/**
 * 레슨은 3차시(각 45분) 분량으로 잘게 나뉜다.
 *   1차시(1~5쪽)  문제를 상태로 보고, 탐색의 재료(노드·확장·OPEN·CLOSED)를 익힌다
 *   2차시(6~9쪽)  자료구조 하나가 알고리즘을 정한다 (BFS·DFS·A*·비교)
 *   3차시(10~14쪽) 순서도 → 의사코드 → 파이썬으로 이어 코드를 읽고 쓴다
 *
 * 원칙
 *  - 한 쪽 = 배울 것 하나. 화면에는 그 하나에 필요한 것만 켠다(혼란 방지).
 *  - goal(배울 것) 문장 안에 "왜 배우나(이유)"를 함께 녹인다.
 *  - algo: 그 쪽에 들어갈 때 자동으로 고정할 알고리즘(안내형 흐름). main.js가 적용.
 */
export const LESSON = [
  // ── 1차시 ─────────────────────────────────────────────────────────────
  {
    id: 'intro',
    title: '8-퍼즐과 상태(state)',
    goal: '숫자 칸을 밀어 목표와 똑같이 만들면 끝나요. 이런 배치 하나하나를 "상태(state)"라고 불러요. 이렇게 이름을 붙여야 컴퓨터가 "지금 어디에 있는지"를 다룰 수 있기 때문이에요.',
    todo: '타일을 눌러 직접 밀어 보세요! 빈칸 옆 타일만 움직여요. 이렇게 상태를 바꾸는 규칙을 "연산자"라고 해요.',
    layout: 'board',
    stage: 'pseudo',
    show: { board: true, play: true },
  },
  {
    id: 'space',
    title: '상태공간과 탐색',
    goal: '한 상태에서 빈칸을 밀면 여러 이웃 상태가 생기고, 그 이웃도 또 이웃을 낳아 거대한 그물이 돼요(상태공간). 경우의 수가 너무 많아 아무렇게나 밀어선 못 풀기 때문에, 시작에서 목표까지 길을 "차근차근 찾는 일"이 필요해요 — 이것이 탐색이에요.',
    todo: '아래 "이웃 상태" 띠를 보세요. 한 배치에서 갈 수 있는 곳이 여러 갈래죠? 이 갈래가 계속 이어진다고 상상해 보세요.',
    layout: 'board',
    stage: 'pseudo',
    algo: 'bfs',
    show: { board: true, children: true },
  },
  {
    id: 'expand',
    title: '노드와 확장(expand)',
    goal: '탐색이 다루는 상태 하나하나를 "노드(node)"라고 해요. 노드를 하나 골라 거기서 만들 수 있는 다음 배치를 모두 만드는 일이 "확장"이에요. 컴퓨터는 한 번에 노드 하나씩만 확장해 조금씩 넓혀 가기 때문에, 이 "확장"이 탐색의 기본 동작이 돼요.',
    todo: '⏭ 한 단계를 눌러 노드를 한 번 확장해 보세요. 아래 "자식 노드" 띠에 다음 배치가 만들어져요. 빈칸 위치에 따라 자식이 2·3·4개로 달라지는 것도 세어 보세요.',
    layout: 'board',
    stage: 'pseudo',
    algo: 'bfs',
    show: { board: true, action: true, controls: true, children: true },
  },
  {
    id: 'open',
    title: 'OPEN — 다음에 볼 노드',
    goal: '확장할 차례를 기다리는 노드를 모아 두는 곳이 OPEN 리스트예요. 다음에 무엇을 확장할지 기억해 두지 않으면 탐색을 이어 갈 수 없기 때문에, 만든 자식은 OPEN에 넣고(push) 확장할 때 꺼내요(pop).',
    todo: '한 단계씩 누르면서 OPEN이 자식이 생길 때 늘고(push), 하나 꺼낼 때 주는(pop) 것을 보세요. (CLOSED는 다음 쪽에서 배워요.)',
    layout: 'board-data',
    stage: 'pseudo',
    algo: 'bfs',
    show: { board: true, action: true, controls: true, open: true, slim: true },
  },
  {
    id: 'closed',
    title: 'CLOSED — 이미 본 노드',
    goal: '확장을 마친 노드는 CLOSED로 옮겨 "이미 봤다"고 표시해요. 이렇게 표시해 두지 않으면 같은 배치를 끝없이 다시 확장해 제자리를 맴돌기 때문이에요(무한 반복 방지·낭비 방지).',
    todo: '한 단계씩 누르면서, OPEN에서 꺼낸 노드가 CLOSED 상자로 옮겨져 쌓이는 것을 보세요. 방금 옮겨진 노드는 주황색이에요.',
    layout: 'board-data',
    stage: 'pseudo',
    algo: 'bfs',
    show: { board: true, action: true, controls: true, open: true, closed: true, slim: true },
  },
  // ── 2차시 ─────────────────────────────────────────────────────────────
  {
    id: 'bfs',
    title: '큐로 꺼내기 = 너비 우선(BFS)',
    goal: 'OPEN을 큐(먼저 넣은 것을 먼저 꺼냄)로 쓰면 얕은 곳부터 빠짐없이 훑어요. 그래서 처음 만나는 해가 곧 가장 짧은 해예요 — 최단 경로가 필요할 때 큐를 쓰는 이유죠. 대신 OPEN이 크게 부풀어 메모리를 많이 써요.',
    todo: '한 단계씩(또는 ▶ 재생) 진행하며 [탐색 트리] 탭에서 트리가 "층층이 넓게" 자라는 것을 보세요. 카운터의 OPEN 최대 크기가 얼마나 커지는지도 보세요.',
    layout: 'board-data',
    stage: 'pseudo',
    algo: 'bfs',
    show: { board: true, action: true, controls: true, open: true, closed: true, tree: true, slim: true },
  },
  {
    id: 'dfs',
    title: '스택으로 꺼내기 = 깊이 우선(DFS)',
    goal: 'OPEN을 스택(마지막에 넣은 것을 먼저 꺼냄)으로 바꾸면 한 갈래로 깊이 파고들어요. OPEN이 얇게 유지돼 메모리는 적게 쓰지만, 처음 찾은 해가 가장 짧다는 보장이 없어요. 8-퍼즐에선 길을 잃고 헤매서, 깊이 제한이 왜 필요한지 몸으로 느끼게 돼요.',
    todo: '한 단계씩 진행하며 [탐색 트리] 탭에서 트리가 "한 줄로 깊게" 내려가는 것을 BFS와 비교해 보세요. 난이도를 바꾸면 파고드는 길이도 달라져요.',
    layout: 'board-data',
    stage: 'pseudo',
    algo: 'dfs',
    show: { board: true, action: true, controls: true, open: true, closed: true, tree: true, slim: true },
  },
  {
    id: 'astar',
    title: '평가값으로 꺼내기 = 최상우선·A*',
    goal: 'OPEN을 우선순위 큐로 두고 "평가값이 작은 노드"부터 꺼내면 목표 쪽으로 똑똑하게 나아가요. A*는 평가값을 f = g + h(온 비용 + 남은 거리 어림값)로 삼아, 빠르면서도 최단 경로를 놓치지 않아요 — 그래서 길찾기에 가장 많이 쓰여요.',
    todo: '한 단계씩 진행하며 OPEN 항목의 f 값을 보세요. 오른쪽 끝(f가 가장 작은 것)이 다음에 나가죠? BFS·DFS보다 확장 노드 수가 훨씬 적은 것도 카운터에서 확인하세요.',
    layout: 'board-data',
    stage: 'pseudo',
    algo: 'astar',
    show: { board: true, action: true, controls: true, open: true, closed: true, tree: true, slim: true },
  },
  {
    id: 'compare',
    title: '자료구조를 바꿔 비교(종합)',
    goal: '큐면 BFS, 스택이면 DFS, 우선순위 큐면 최상우선·A*. 자료구조 하나를 고르는 일이 곧 알고리즘을 고르는 일이었어요 — 이 한 문장이 2차시의 핵심이에요.',
    todo: '"OPEN 자료구조 ="를 바꿔 가며 같은 퍼즐이 어떻게 다르게 풀리는지 보세요. [자료구조]·[탐색 트리] 탭을 오가며 모양과 크기를 비교해 보세요.',
    layout: 'board-data',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, open: true, closed: true, tree: true, picker: true, slim: true },
  },
  // ── 3차시 ─────────────────────────────────────────────────────────────
  {
    id: 'flow',
    title: '순서도로 흐름 읽기 — 왜 이 모양?',
    goal: '지금까지 눈으로 본 절차를 그림으로 적은 것이 순서도예요. 판단(◇)과 처리(□)와 되돌이 화살표가 왜 이 자리에 있는지 알면, 어떤 탐색이든 순서도만 보고 흐름을 읽을 수 있어요.',
    todo: '한 단계씩 누르면 지금 실행 중인 도형이 강조돼요. 아래 "왜 이 모양인가" 설명과 맞춰 보며, 판단 두 개(비었나?·목표인가?)와 되돌이 화살표의 뜻을 확인하세요.',
    layout: 'code-board',
    stage: 'pseudo',
    show: { code: true, flowwhy: true, board: true, controls: true },
  },
  {
    id: 'read',
    title: '의사코드 한 줄씩 읽기',
    goal: '순서도를 말과 코드 중간쯤으로 옮긴 것이 의사코드예요. 빈칸을 채우기 전에, 각 줄이 무슨 일을 하고 왜 필요한지 한 줄씩 읽어 두면 다음 쪽에서 무엇을 넣어야 할지 알 수 있어요.',
    todo: '한 단계씩 누르면 지금 실행 중인 줄이 강조돼요. 오른쪽 설명으로 그 줄이 하는 일을 확인하고, 특히 "꺼내는 줄"이 알고리즘을 정한다는 점에 주목하세요.',
    layout: 'code-board',
    stage: 'pseudo',
    show: { code: true, coderead: true, board: true, controls: true },
  },
  {
    id: 'fill',
    title: '빈칸 채우기 — 코드 한 줄의 힘',
    goal: '앞에서 읽은 코드에서, 알고리즘의 성격을 정하는 딱 한 곳만 빈칸으로 남겼어요. 그 한 줄(예: 꺼내는 자리 pop)만 바꿔도 알고리즘이 통째로 달라지는 것을 직접 확인해요.',
    todo: '빈칸을 골라 "이 코드로 실행"을 눌러 보세요. 확장 노드 수와 해의 길이가 어떻게 달라지나요? 아래 "이 코드가 하는 일" 표도 참고하세요.',
    layout: 'code-board',
    stage: 'fill',
    show: { board: true, code: true, controls: true, codemap: true },
  },
  {
    id: 'write',
    title: '파이썬으로 직접 작성',
    goal: '이제 탐색 알고리즘을 파이썬으로 직접 써 봐요. 브라우저 안에서 진짜 파이썬이 실행돼, 내가 쓴 코드가 정말 도는지 눈으로 확인할 수 있어요.',
    todo: '코드를 고치고 "내 코드 실행"을 누르면, 내가 찾은 해 경로가 퍼즐 판에서 재생돼요.',
    layout: 'code-board',
    stage: 'write',
    show: { board: true, code: true, controls: true },
  },
  {
    id: 'wrapup',
    title: '오늘 배운 것 정리',
    goal: '상태·노드·확장·OPEN·CLOSED에서 시작해, 자료구조 하나가 알고리즘을 정하고, 그것이 순서도·의사코드·파이썬으로 같은 절차라는 것까지 왔어요.',
    todo: '아래 표로 배운 것을 되짚고, ⚖ 비교와 📖 용어로 한 번 더 확인해 보세요.',
    layout: 'code',
    stage: 'pseudo',
    show: { code: true, summary: true },
  },
];

/** 레슨 id로 쪽 번호(0부터)를 찾는다. 매직 넘버 대신 쓰면 쪽 순서가 바뀌어도 안전하다. */
export function lessonIndexById(id) {
  const i = LESSON.findIndex((step) => step.id === id);
  return i < 0 ? 0 : i;
}

export function lessonAt(index) {
  const i = Math.max(0, Math.min(LESSON.length - 1, index | 0));
  return LESSON[i];
}

/**
 * 지금 탭에서 쓸 쪽 묶음을 돌려준다.
 * 탐색 탭과 자료구조 탭이 같은 진행 막대를 함께 쓰기 위한 다리.
 */
export function currentLesson(state) {
  if (state.mode === 'ds') {
    return { steps: DS_LESSON, index: Math.max(0, Math.min(DS_LESSON.length - 1, state.dsStep | 0)), key: 'dsStep' };
  }
  return { steps: LESSON, index: Math.max(0, Math.min(LESSON.length - 1, state.lessonStep | 0)), key: 'lessonStep' };
}
