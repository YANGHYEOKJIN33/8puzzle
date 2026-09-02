/**
 * 학습 2단계(빈칸 채우기) 문제 모음 (요구사항 5.2).
 *
 * 거의 완성된 파이썬 코드에서 알고리즘의 성격을 결정하는 "한 곳"만 빈칸으로 둔다.
 * 학생이 빈칸을 고르면, 그 선택이 어떤 알고리즘/휴리스틱이 되는지(run)와 그 까닭(note)이
 * 정해져 있다. 실행하면 바로 그 탐색을 돌려 시각화하고, 무엇이 달라졌는지 보여 준다.
 *
 * 문법 오류로 학생이 좌절하지 않도록 빈칸은 드롭다운 선택으로만 채운다 (요구사항 5.2.2).
 *
 * lines: 각 줄은 문자열이거나, 문자열과 { blank: 'id' } 조각들의 배열.
 */
export const EXERCISES = [
  {
    id: 'blind-pop',
    title: '맹목적 탐색 — OPEN에서 어디를 꺼낼까?',
    intro: 'OPEN을 리스트로 두고, 꺼내는 자리(pop의 위치)만 바꿔 봅니다. 같은 코드가 큐도 되고 스택도 됩니다.',
    lines: [
      'while OPEN:                     # OPEN이 빌 때까지',
      ['    n = OPEN.pop(', { blank: 'pos' }, ')            # 어느 자리에서 꺼낼까?'],
      '    if is_goal(n): return path(n)',
      '    CLOSED.add(n)',
      '    for c in children(n):       # 자식들을',
      '        if c not in seen:',
      '            OPEN.append(c)      # OPEN의 "뒤"에 붙인다',
    ],
    blanks: {
      pos: {
        label: '꺼낼 자리',
        options: [
          { text: '0   (맨 앞)', value: '0', run: { algorithmId: 'bfs' },
            note: '맨 앞에서 꺼내면 "먼저 들어온 것이 먼저" 나가는 큐 → 너비 우선 탐색(BFS)' },
          { text: '-1  (맨 뒤)', value: '-1', run: { algorithmId: 'dfs' },
            note: '맨 뒤에서 꺼내면 "마지막에 넣은 것이 먼저" 나가는 스택 → 깊이 우선 탐색(DFS)' },
        ],
      },
    },
    hint: '정답이 하나로 정해져 있지 않습니다 — 두 값이 서로 다른 알고리즘을 만듭니다. 둘 다 눌러 해의 길이를 비교해 보세요.',
  },
  {
    id: 'heuristic-sort',
    title: '경험적 탐색 — 무엇을 기준으로 고를까?',
    intro: '매번 OPEN을 평가값 순으로 정렬한 뒤 맨 앞을 꺼냅니다. 정렬 기준 하나가 알고리즘을 바꿉니다.',
    lines: [
      'while OPEN:',
      ['    OPEN.sort(key=lambda n: ', { blank: 'key' }, ')   # 무엇이 작은 것부터?'],
      '    n = OPEN.pop(0)             # 가장 앞(가장 작은 값)을 꺼낸다',
      '    if is_goal(n): return path(n)',
      '    CLOSED.add(n)',
      '    OPEN += children(n)',
    ],
    blanks: {
      key: {
        label: '정렬 기준',
        options: [
          { text: 'n.h           (남은 거리 어림값만)', value: 'n.h', run: { algorithmId: 'best', heuristicId: 'h2' },
            note: 'h만 보면 최상 우선 탐색 — 목표로 빠르게 돌진하지만 최단해는 아닐 수 있음' },
          { text: 'n.g + n.h     (지금까지 비용 + 어림값)', value: 'n.g + n.h', run: { algorithmId: 'astar', heuristicId: 'h2' },
            note: 'g+h를 보면 A* — 허용적 휴리스틱이면 최단해를 보장' },
        ],
      },
    },
    hint: 'g(지금까지 든 비용)를 더하느냐 마느냐의 차이입니다. 해의 길이와 펼친 노드 수를 비교해 보세요.',
  },
  {
    id: 'heuristic-def',
    title: '휴리스틱 — 남은 거리를 어떻게 어림잡을까?',
    intro: 'A*가 쓰는 h(state)를 직접 정해 봅니다. 어림이 똑똑할수록 A*는 적게 헤맵니다.',
    lines: [
      'def h(state):',
      ['    return ', { blank: 'h' }],
      '',
      '# A* 는 f(n) = g(n) + h(n) 으로 노드를 고릅니다',
    ],
    blanks: {
      h: {
        label: '어림 방법',
        options: [
          { text: '0                       (아무 정보도 없음)', value: '0', run: { algorithmId: 'astar', heuristicId: 'h0' },
            note: 'h=0이면 A*가 균일 비용 탐색이 됨 — 최단이지만 아주 많이 펼침' },
          { text: '제자리 아닌 타일 수',       value: 'misplaced', run: { algorithmId: 'astar', heuristicId: 'h1' },
            note: '세기 쉬운 대신 정보가 적어, A*가 그럭저럭 펼침' },
          { text: '맨해튼 거리 합',           value: 'manhattan', run: { algorithmId: 'astar', heuristicId: 'h2' },
            note: '가장 똑똑한 어림 — A*가 훨씬 적은 노드만 펼쳐도 됨' },
        ],
      },
    },
    hint: '세 가지 모두 "실제보다 크게 잡지 않아" A*의 최단성은 유지됩니다. 다른 것은 "펼친 노드 수"입니다.',
  },
];

export function findExercise(id) {
  return EXERCISES.find((ex) => ex.id === id) ?? EXERCISES[0];
}
