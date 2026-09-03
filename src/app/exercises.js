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
 *
 * preview: 고른 값이 "실제 퍼즐 배치"에 무슨 일을 하는지 그림으로 보여 줄 방식.
 *          'pop'  — OPEN에 든 배치들 중 어느 것을 꺼내는지
 *          'sort' — 정렬 기준에 따라 어느 배치가 맨 앞이 되는지
 *          'h'    — 어림 방법마다 같은 배치의 h 값이 얼마나 되는지
 * map:     코드 한 줄이 8-퍼즐에서 무슨 일인지 (학생이 가장 막히는 곳)
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
    hint: '두 값 모두 정답 — 서로 다른 알고리즘이 됩니다. 둘 다 눌러 비교해 보세요.',
    preview: 'pop',
    map: [
      ['while OPEN:', '살펴볼 배치가 아직 남았나? (OPEN이 비면 끝)'],
      ['OPEN.pop(자리)', 'OPEN에 든 배치들 중 하나를 골라 꺼낸다'],
      ['is_goal(n)', 'n이 1~8이 차례로 놓인 목표 배치인가?'],
      ['path(n)', 'n까지 온 길 = 빈칸을 어느 쪽으로 밀었는지의 순서'],
      ['CLOSED.add(n)', '이 배치는 이미 살펴봤다고 표시한다'],
      ['children(n)', '빈칸을 상·하·좌·우로 밀어 만들 수 있는 새 배치들'],
      ['OPEN.append(c)', '새 배치를 OPEN의 맨 뒤에 넣는다'],
    ],
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
    hint: 'g를 더하느냐 마느냐의 차이. 해의 길이와 확장한 노드 수를 비교해 보세요.',
    preview: 'sort',
    map: [
      ['OPEN.sort(key=…)', 'OPEN에 든 배치들을 평가값이 작은 순서로 줄 세운다'],
      ['n.g', '초기 배치에서 이 배치까지 실제로 민 횟수'],
      ['n.h', '이 배치에서 목표까지 남았을 것으로 어림잡은 값'],
      ['OPEN.pop(0)', '줄 맨 앞(평가값이 가장 작은 배치)을 꺼낸다'],
      ['OPEN += children(n)', '빈칸을 밀어 만든 새 배치들을 OPEN에 넣는다'],
    ],
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
    hint: '세 가지 모두 최단해는 보장됩니다. 다른 것은 “확장한 노드 수”예요.',
    preview: 'h',
    map: [
      ['def h(state):', 'state(퍼즐 배치) 하나를 받아 "남은 거리 어림값"을 돌려주는 함수'],
      ['return 0', '아무 정보도 안 쓴다 — 어느 배치든 0'],
      ['제자리 아닌 타일 수', '제자리에 없는 타일이 몇 개인지 센다 (빈칸은 세지 않음)'],
      ['맨해튼 거리 합', '타일마다 제자리까지 가로·세로 몇 칸인지 세어 모두 더한다'],
      ['f(n) = g(n) + h(n)', 'A*는 이 값이 가장 작은 배치부터 확장한다'],
    ],
  },
];

export function findExercise(id) {
  return EXERCISES.find((ex) => ex.id === id) ?? EXERCISES[0];
}
