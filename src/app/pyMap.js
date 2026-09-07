/**
 * 의사코드 ↔ 파이썬 대치표 (레슨: 알고리즘 ④쪽).
 *
 * 각 알고리즘 모듈의 pseudo(줄 배열)와 1:1로 맞춘 파이썬 줄을 둔다. 학생이 파이썬을
 * 몰라도, 밟을 때마다 같은 줄이 양쪽에서 켜지며 "이 의사코드 = 이 파이썬"을 눈으로 잇는다.
 *
 *  py       : pseudo와 같은 길이의 파이썬 줄 배열
 *  coreLine : 알고리즘의 성격을 정하는 "핵심 한 줄"의 번호(0부터)
 *  swap     : 핵심 한 줄을 바꿔 다른 알고리즘이 되는 실험 (없으면 null)
 *             options의 algoTab을 고르면 그 알고리즘 하위 탭으로 바뀐다.
 */
export const PY_MAP = {
  bfs: {
    py: [
      'OPEN = [start]',
      'CLOSED = set()',
      'while OPEN:',
      '    n = OPEN.pop(0)',
      '    if is_goal(n): return path(n)',
      '    CLOSED.add(n); kids = children(n)',
      '    for c in kids:  # OPEN·CLOSED에 없으면 append',
      'return None  # 실패',
    ],
    coreLine: 3,
    coreWhy: 'pop(0) = 맨 앞을 꺼냄 → 먼저 들어온 것이 먼저(FIFO) → 너비 우선.',
    swap: {
      label: '꺼내는 자리',
      options: [
        { text: 'OPEN.pop(0)   → 너비 우선(BFS)', algoTab: 'bfs' },
        { text: 'OPEN.pop(-1)  → 깊이 우선(DFS)', algoTab: 'dfs' },
      ],
    },
  },
  dfs: {
    py: [
      'OPEN = [start]',
      'CLOSED = set()',
      'while OPEN:',
      '    n = OPEN.pop(-1)',
      '    if is_goal(n): return path(n)',
      '    CLOSED.add(n); kids = children(n)',
      '    for c in kids:  # OPEN·CLOSED에 없으면 append',
      'return None  # 실패',
    ],
    coreLine: 3,
    coreWhy: 'pop(-1) = 맨 뒤를 꺼냄 → 마지막에 넣은 것이 먼저(LIFO) → 깊이 우선.',
    swap: {
      label: '꺼내는 자리',
      options: [
        { text: 'OPEN.pop(0)   → 너비 우선(BFS)', algoTab: 'bfs' },
        { text: 'OPEN.pop(-1)  → 깊이 우선(DFS)', algoTab: 'dfs' },
      ],
    },
  },
  best: {
    py: [
      'OPEN = [start]',
      'CLOSED = set()',
      'while OPEN:',
      '    n = min(OPEN, key=lambda x: x.h)',
      '    if is_goal(n): return path(n)',
      '    CLOSED.add(n); kids = children(n)',
      '    OPEN.remove(n); OPEN += new_kids',
      'return None  # 실패',
    ],
    coreLine: 3,
    coreWhy: 'key = x.h → 남은 거리 어림값 h가 가장 작은 것부터 → 최상 우선.',
    swap: {
      label: '정렬 기준',
      options: [
        { text: 'key = x.h         → 최상 우선', algoTab: 'best' },
        { text: 'key = x.g + x.h   → A*', algoTab: 'astar' },
      ],
    },
  },
  astar: {
    py: [
      'OPEN = [start]',
      'CLOSED = set()',
      'while OPEN:',
      '    n = min(OPEN, key=lambda x: x.g + x.h)',
      '    if is_goal(n): return path(n)',
      '    CLOSED.add(n); kids = children(n)',
      '    OPEN.remove(n); OPEN += new_kids',
      'return None  # 실패',
    ],
    coreLine: 3,
    coreWhy: 'key = x.g + x.h → 온 비용 g와 어림값 h를 함께 → 빠르면서 최단(A*).',
    swap: {
      label: '정렬 기준',
      options: [
        { text: 'key = x.h         → 최상 우선', algoTab: 'best' },
        { text: 'key = x.g + x.h   → A*', algoTab: 'astar' },
      ],
    },
  },
  hill: {
    py: [
      'current = start',
      'while True:',
      '    if is_goal(current): return path(current)',
      '    nbrs = children(current)',
      '    best = min(nbrs, key=lambda x: x.h)',
      '    if best.h >= current.h: break  # 지역 최적',
      '    current = best',
    ],
    coreLine: 4,
    coreWhy: 'min(..., key=x.h) → 가장 좋아 보이는 이웃 하나만 골라 옮김(국소 탐색).',
    swap: null,
  },
};

export function pyMapFor(algoId) {
  return PY_MAP[algoId] || PY_MAP.bfs;
}
