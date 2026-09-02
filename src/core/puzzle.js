/**
 * 8-퍼즐의 규칙 — 화면을 전혀 모르는 순수 로직 (요구사항 3.1 · 7.5.1).
 *
 * 상태(state)는 길이 9의 배열이다. 왼쪽 위부터 오른쪽 아래로 읽으며 0은 빈칸이다.
 *
 *   [1, 2, 3,        1 2 3
 *    4, 0, 6,   →    4 _ 6
 *    7, 5, 8]        7 5 8
 *
 * 상태는 만들고 나면 바꾸지 않는다(불변). 이동은 언제나 새 배열을 만들어 돌려준다.
 * 이렇게 해야 탐색 기록을 남겨 두었다가 되감기(요구사항 4.3.1)를 할 때 안전하다.
 */

/** 한 변의 칸 수 */
export const SIZE = 3;

/** 빈칸을 나타내는 값 */
export const BLANK = 0;

/** 기본 목표 상태 (요구사항 3.1) */
export const GOAL = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 0]);

/**
 * 빈칸이 움직이는 네 방향.
 * 교과서에서 연산자를 "빈칸을 위로" 식으로 적는 관례를 따른다.
 * 목록의 순서는 탐색 결과의 순서를 정하므로 고정한다 — 학생이 볼 때마다 같아야 한다.
 */
export const MOVES = Object.freeze([
  { dir: 'up',    label: '빈칸 ↑', dRow: -1, dCol: 0 },
  { dir: 'down',  label: '빈칸 ↓', dRow: 1,  dCol: 0 },
  { dir: 'left',  label: '빈칸 ←', dRow: 0,  dCol: -1 },
  { dir: 'right', label: '빈칸 →', dRow: 0,  dCol: 1 },
]);

/** 상태를 문자열 하나로 — 방문 여부를 확인할 때 쓴다 ('123456780') */
export function key(state) {
  return state.join('');
}

/** key()가 만든 문자열을 다시 상태로 */
export function fromKey(text) {
  return [...text].map(Number);
}

/** 칸 번호 → 행·열 */
export function rowCol(index) {
  return { row: Math.floor(index / SIZE), col: index % SIZE };
}

/** 행·열 → 칸 번호 (판 밖이면 -1) */
export function indexOf(row, col) {
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return -1;
  return row * SIZE + col;
}

/** 빈칸의 위치 */
export function blankIndex(state) {
  return state.indexOf(BLANK);
}

/** 목표에 도달했는가 */
export function isGoal(state, goal = GOAL) {
  for (let i = 0; i < state.length; i += 1) {
    if (state[i] !== goal[i]) return false;
  }
  return true;
}

/** 0~8이 하나씩 들어 있는 올바른 상태인가 */
export function isValidState(state) {
  if (!Array.isArray(state) || state.length !== SIZE * SIZE) return false;
  const seen = new Set(state);
  if (seen.size !== state.length) return false;
  return state.every((tile) => Number.isInteger(tile) && tile >= 0 && tile < SIZE * SIZE);
}

/**
 * 지금 상태에서 한 번에 갈 수 있는 상태들 (요구사항 3.2 · 5.3.1의 expand)
 *
 * 돌려주는 값 하나하나는 이렇게 생겼다.
 *   { state, dir, label, tile, from, to }
 *     state : 옮긴 뒤의 새 상태
 *     dir   : 빈칸이 움직인 방향
 *     tile  : 실제로 밀린 타일의 숫자 (화면에서 강조할 때 쓴다)
 *     from  : 밀린 타일이 있던 칸 번호
 *     to    : 밀린 타일이 도착한 칸 번호(= 원래 빈칸 자리)
 */
export function expand(state) {
  const blank = blankIndex(state);
  const { row, col } = rowCol(blank);
  const result = [];

  for (const move of MOVES) {
    const target = indexOf(row + move.dRow, col + move.dCol);
    if (target === -1) continue;

    const next = state.slice();
    next[blank] = state[target];
    next[target] = BLANK;

    result.push({
      state: next,
      dir: move.dir,
      label: move.label,
      tile: state[target],
      from: target,
      to: blank,
    });
  }
  return result;
}

/**
 * 역위(inversion) 수 — 빈칸을 뺀 나머지를 한 줄로 늘어놓았을 때
 * 앞의 수가 뒤의 수보다 큰 짝의 개수.
 */
export function inversions(state) {
  const tiles = state.filter((tile) => tile !== BLANK);
  let count = 0;
  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i] > tiles[j]) count += 1;
    }
  }
  return count;
}

/**
 * 해가 존재하는가 (요구사항 3.1.2)
 *
 * 한 번 밀 때마다 역위 수는 짝수만큼 바뀐다(3x3처럼 한 변이 홀수인 판에서).
 * 그래서 역위 수의 홀짝이 목표와 다르면 아무리 밀어도 도달할 수 없다.
 */
export function isSolvable(state, goal = GOAL) {
  return inversions(state) % 2 === inversions(goal) % 2;
}

/** 목표에서 무작위로 n번 밀어 초기 상태를 만든다 — 반드시 풀 수 있는 상태가 된다 */
export function shuffle(steps = 20, goal = GOAL, random = Math.random) {
  let state = goal.slice();
  let previous = null;

  for (let i = 0; i < steps; i += 1) {
    // 방금 온 길로 되돌아가면 제자리걸음이 되므로 뺀다
    const options = expand(state).filter((option) => key(option.state) !== previous);
    if (options.length === 0) break;
    previous = key(state);
    state = options[Math.floor(random() * options.length)].state;
  }
  return state;
}

/** 사람이 읽는 3줄짜리 글자 그림 — 테스트와 콘솔 확인용 */
export function format(state) {
  const lines = [];
  for (let row = 0; row < SIZE; row += 1) {
    lines.push(
      state.slice(row * SIZE, row * SIZE + SIZE)
        .map((tile) => (tile === BLANK ? '_' : String(tile)))
        .join(' '),
    );
  }
  return lines.join('\n');
}
