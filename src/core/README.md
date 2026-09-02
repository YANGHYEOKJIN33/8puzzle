# `src/core/` — 탐색 엔진

화면 코드와 분리된 **순수 로직**만 이곳에 둔다 (요구사항 7.5.1).
이 폴더의 코드는 DOM을 전혀 모르며, 브라우저 없이도 테스트할 수 있어야 한다.

## 파일

| 파일 | 역할 | 상태 |
|---|---|---|
| `puzzle.js` | 상태 표현, 다음 상태 만들기(`expand`), 해 존재 판정, 섞기 | ✅ 3단계 완료 |
| `heuristics.js` | `h0`(항상 0) / `h1`(제자리 아닌 타일 수) / `h2`(맨해튼 거리 합) | ✅ 3단계 완료 |
| `trace.js` | 탐색 한 단계를 기록하는 공통 형식(step trace)과 델타 방식 OPEN | ✅ 4단계 완료 |
| `algorithms/_graphSearch.js` | BFS·DFS가 함께 쓰는 그래프 탐색 뼈대 | ✅ 4단계 완료 |
| `algorithms/bfs.js` / `dfs.js` | 너비 우선 / 깊이 우선 (한 파일씩) | ✅ 4단계 완료 |
| `algorithms/index.js` | 알고리즘 등록소 — 새 알고리즘은 여기 한 줄 추가 | ✅ 4단계 완료 |
| `algorithms/hill.js`, `best.js`, `astar.js`, `dls.js`, `ids.js` | 나머지 알고리즘 | 7단계 |

### `puzzle.js`가 내놓는 것

```js
GOAL, SIZE, BLANK, MOVES        // 규칙 상수
key(state) / fromKey(text)      // 방문 확인용 문자열 '123456780'
rowCol(i) / indexOf(row, col)   // 칸 번호 ↔ 행·열
blankIndex(state)               // 빈칸 위치
isGoal(state, goal?)            // 목표 도달 여부
isValidState(state)             // 0~8이 하나씩 있는가
expand(state)                   // [{ state, dir, label, tile, from, to }, ...]
inversions(state)               // 역위 수
isSolvable(state, goal?)        // 해가 존재하는가 (요구사항 3.1.2)
shuffle(steps, goal?, random?)  // 목표에서 섞어 만든 "반드시 풀리는" 상태
format(state)                   // 3줄짜리 글자 그림
```

`expand`는 언제나 **새 배열**을 돌려주고 원본을 건드리지 않는다.
되감기(요구사항 4.3.1)가 이 성질에 기대고 있으므로 반드시 지킨다.

### `heuristics.js`가 내놓는 것

```js
h0(state)                       // 언제나 0 → A*가 균일 비용 탐색이 된다
h1(state, goal?)                // 제자리에 없는 타일 수 (빈칸은 세지 않는다)
h2(state, goal?)                // 맨해튼 거리의 합
getHeuristic('h2')              // 화면에서 고른 이름으로 함수 찾기
```

셋 다 실제 남은 거리를 넘겨 잡지 않는다(허용적). 테스트가 매번 이를 확인한다.

## 설계 원칙

알고리즘은 화면을 직접 고치지 않는다.
대신 **"무슨 일이 일어났는지"를 한 단계씩 기록한 목록**을 만들어 돌려주고,
화면은 그 목록을 앞뒤로 오가며 그리기만 한다.
이렇게 해야 **한 단계 뒤로 가기**(요구사항 4.3.1)를 간단하게 만들 수 있다.

### 한 단계 기록(frame)의 실제 형식

```js
{
  line: 4,                    // 강조할 의사코드/파이썬 줄 번호
  action: 'pop',              // init|pop|goal|make|push|skip|exhausted|limit
  narration: 'OPEN의 맨 앞에서 노드를 꺼냅니다.',
  currentId: 12,              // 지금 다루는 노드 id (registry에서 state를 찾는다)
  delta: { op: 'pop', id: 12, end: 'front' },  // OPEN이 이번에 바뀐 내용
  openSize: 7,                // 이 시점 OPEN 크기
  highlight: 12,              // 방금 넣거나 꺼낸 노드 (초록/회색 강조)
  closedSize: 5,
  counters: { generated, expanded, maxOpen, depth },
}
```

**OPEN을 통째로 넣지 않는다.** 프레임마다 OPEN 전체를 복사하면 전체 비용이
O(단계수²)가 되어 브라우저가 멈춘다(특히 DFS). 그래서 "이번에 무엇이 들고 났는지"인
`delta`만 담고, 화면은 OPEN 배열 하나를 들고 델타를 앞뒤로 적용한다.
`trace.js`의 `openSequence()`가 이 되짚기의 참고 구현이다.

> DFS 주의: 8-퍼즐에서 전역 방문표를 쓰는 DFS는 얕은 문제도 상한까지 헤맨다.
> 이는 DFS의 본래 약점이며, 깊이 제한 탐색·반복적 깊이 심화(7단계)가 필요한 이유다.
