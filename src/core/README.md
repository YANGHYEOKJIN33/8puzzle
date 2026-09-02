# `src/core/` — 탐색 엔진

화면 코드와 분리된 **순수 로직**만 이곳에 둔다 (요구사항 7.5.1).
이 폴더의 코드는 DOM을 전혀 모르며, 브라우저 없이도 테스트할 수 있어야 한다.

## 파일

| 파일 | 역할 | 상태 |
|---|---|---|
| `puzzle.js` | 상태 표현, 다음 상태 만들기(`expand`), 해 존재 판정, 섞기 | ✅ 3단계 완료 |
| `heuristics.js` | `h0`(항상 0) / `h1`(제자리 아닌 타일 수) / `h2`(맨해튼 거리 합) | ✅ 3단계 완료 |
| `trace.js` | 탐색 한 단계를 기록하는 공통 형식(step trace) 정의 | 4단계 |
| `algorithms/bfs.js` 등 | 알고리즘마다 한 파일 (요구사항 7.5.3) | 4·7단계 |

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

```js
// 한 단계 기록의 예 (4단계에서 확정)
{
  line: 7,                    // 지금 실행 중인 의사코드/파이썬 줄 번호
  action: 'pop',              // pop | push | goal | skip | expand ...
  node: { state, g, h, parent },
  open: [ /* 이 시점의 OPEN 전체 */ ],
  closed: 42,                 // 이 시점의 CLOSED 크기
  narration: 'OPEN의 맨 앞에서 노드를 꺼냅니다.',
}
```
