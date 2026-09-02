/**
 * 학습 3단계에서 파이썬 쪽에 미리 깔아 두는 코드와, 학생에게 주는 시작 코드·정답.
 * (요구사항 5.3.1 — 제공 API / 5.3.5 — 정답 보기)
 */

/** 학생 코드보다 먼저 실행되어 8-퍼즐 도우미를 파이썬에 정의한다. */
export const PREAMBLE = `
GOAL = (1, 2, 3, 4, 5, 6, 7, 8, 0)

_EXPAND_CALLS = 0
_STEP_LIMIT = 200000   # 무한 루프 방지 (요구사항 5.3.4)

def expand(state):
    "빈칸을 상·하·좌·우로 밀어 갈 수 있는 다음 상태들의 리스트"
    global _EXPAND_CALLS
    _EXPAND_CALLS += 1
    if _EXPAND_CALLS > _STEP_LIMIT:
        raise RuntimeError("탐색이 너무 오래 걸립니다 (step limit)")
    state = tuple(state)
    b = state.index(0)
    r, c = divmod(b, 3)
    result = []
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            t = nr * 3 + nc
            lst = list(state)
            lst[b], lst[t] = lst[t], lst[b]
            result.append(tuple(lst))
    return result

def is_goal(state, goal=GOAL):
    return tuple(state) == tuple(goal)

def h1(state, goal=GOAL):
    "제자리에 없는 타일 수"
    return sum(1 for a, b in zip(state, goal) if a != 0 and a != b)

def h2(state, goal=GOAL):
    "맨해튼 거리 합"
    home = {v: i for i, v in enumerate(goal)}
    total = 0
    for i, v in enumerate(state):
        if v == 0:
            continue
        r1, c1 = divmod(i, 3)
        r2, c2 = divmod(home[v], 3)
        total += abs(r1 - r2) + abs(c1 - c2)
    return total
`;

/** 학생이 처음 보는 시작 코드 — 뼈대만 있고 핵심 한 곳이 비어 있다. */
export const STARTER = `# 8-퍼즐을 푸는 search 함수를 완성하세요.
#
# 쓸 수 있는 것:
#   start, goal            시작/목표 상태 (예: (1,2,3,4,5,6,7,8,0))
#   expand(state)          다음에 갈 수 있는 상태들의 리스트
#   is_goal(state)         목표면 True
#   h1(state), h2(state)   남은 거리 어림값
#
# 목표까지의 경로(상태들의 리스트)를 돌려주세요. 못 찾으면 None.

from collections import deque

def search(start, goal):
    OPEN = deque([start])         # 너비 우선 탐색이라면 큐
    parent = {start: None}
    while OPEN:
        n = OPEN.popleft()        # 큐의 맨 앞에서 꺼낸다
        if is_goal(n):
            return build_path(parent, n)

        # TODO: n의 자식들을 만들어, 처음 보는 것만 OPEN에 넣으세요.
        #       힌트:  for c in expand(n):
        #                  if c not in parent:
        #                      ...

    return None


def build_path(parent, n):
    "목표에서 시작까지 거슬러 올라가 경로를 만든다 (이미 완성되어 있습니다)"
    path = []
    while n is not None:
        path.append(n)
        n = parent[n]
    return path[::-1]
`;

/** 정답 보기 (요구사항 5.3.5) — 한 번 실행해 본 뒤 열람 */
export const ANSWER = `from collections import deque

def search(start, goal):
    OPEN = deque([start])
    parent = {start: None}
    while OPEN:
        n = OPEN.popleft()
        if is_goal(n):
            return build_path(parent, n)
        for c in expand(n):           # 자식들을 만들어
            if c not in parent:       # 처음 보는 상태만
                parent[c] = n
                OPEN.append(c)
    return None


def build_path(parent, n):
    path = []
    while n is not None:
        path.append(n)
        n = parent[n]
    return path[::-1]
`;
