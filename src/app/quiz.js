/**
 * 이해 확인 문제 (레슨: 정리·확인 탭).
 * 자료구조와 알고리즘의 이음, 휴리스틱의 뜻을 객관식으로 되짚는다.
 * 각 문제: { q(질문), options([{text, ok}]), why(정답 이유) }.
 */
export const QUIZ = [
  {
    q: '먼저 들어온 것이 먼저 나가는(FIFO) 자료구조는 무엇인가요?',
    options: [
      { text: '큐 (Queue)', ok: true },
      { text: '스택 (Stack)', ok: false },
      { text: '우선순위 큐', ok: false },
    ],
    why: '큐는 FIFO — 먼저 줄 선 사람이 먼저 나갑니다. OPEN을 큐로 쓰면 너비 우선(BFS)이 돼요.',
  },
  {
    q: 'OPEN을 스택(LIFO)으로 쓰면 어떤 탐색이 되나요?',
    options: [
      { text: '깊이 우선 탐색(DFS)', ok: true },
      { text: '너비 우선 탐색(BFS)', ok: false },
      { text: 'A* 탐색', ok: false },
    ],
    why: '스택은 마지막에 넣은 것을 먼저 꺼내므로, 한 갈래로 깊이 파고드는 깊이 우선이 됩니다.',
  },
  {
    q: '휴리스틱 h(n)이 뜻하는 것은?',
    options: [
      { text: '목표까지 얼마나 남았는지 어림잡은 값', ok: true },
      { text: '시작부터 지금까지 실제로 온 비용', ok: false },
      { text: '자식 노드의 개수', ok: false },
    ],
    why: 'h(n)은 "남은 거리 어림값"이에요. 아직 안 가 봤어도 대략 재서 목표에 가까운 노드부터 봐요.',
  },
  {
    q: 'A*의 평가함수 f = g + h 에서 g는 무엇인가요?',
    options: [
      { text: '시작부터 지금까지 실제로 온 비용', ok: true },
      { text: '목표까지 남은 어림값', ok: false },
      { text: 'OPEN에 든 노드 수', ok: false },
    ],
    why: 'g는 온 비용(=깊이), h는 남은 어림값. A*는 둘을 더한 f가 작은 것부터 꺼내 빠르면서 최단을 노려요.',
  },
  {
    q: '다음 중 "처음 찾은 해가 가장 짧다"는 보장이 없는 것은?',
    options: [
      { text: '깊이 우선 탐색(DFS)', ok: true },
      { text: '너비 우선 탐색(BFS)', ok: false },
      { text: 'A* (허용적 휴리스틱)', ok: false },
    ],
    why: '깊이 우선은 한 갈래로 내려가다 만난 해라서 최단이 아닐 수 있어요. BFS·A*는 최단을 보장합니다.',
  },
];
