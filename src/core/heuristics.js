/**
 * 휴리스틱 — "목표까지 앞으로 얼마나 남았을까"를 어림잡는 함수 (요구사항 3.2.2).
 *
 * 셋 다 실제로 남은 거리보다 크게 잡는 일이 없다(허용적, admissible).
 * 그래서 A*가 이 함수들을 쓰면 최적해를 찾는다.
 */

import { BLANK, GOAL, SIZE, rowCol } from './puzzle.js';

/**
 * h0 — 언제나 0.
 * 아무 정보도 주지 않는 휴리스틱. A*에 넣으면 균일 비용 탐색과 똑같이 움직인다.
 * "휴리스틱이 없으면 어떻게 되는지"를 학생이 직접 비교해 보라고 둔다.
 */
export function h0() {
  return 0;
}

/**
 * h1 — 제자리에 있지 않은 타일의 개수.
 * 빈칸은 세지 않는다. 빈칸을 세면 실제보다 크게 잡을 수 있어 최적성이 깨진다.
 */
export function h1(state, goal = GOAL) {
  let count = 0;
  for (let i = 0; i < state.length; i += 1) {
    if (state[i] !== BLANK && state[i] !== goal[i]) count += 1;
  }
  return count;
}

/**
 * h2 — 맨해튼 거리의 합.
 * 각 타일이 제자리까지 가로·세로로 몇 칸 가야 하는지를 모두 더한다.
 * h1보다 많은 것을 알려 주므로 A*가 훨씬 적은 노드만 펼쳐도 된다.
 */
export function h2(state, goal = GOAL) {
  // 목표에서 각 타일이 있어야 할 자리를 미리 찾아 둔다
  const home = new Array(SIZE * SIZE);
  for (let i = 0; i < goal.length; i += 1) home[goal[i]] = i;

  let total = 0;
  for (let i = 0; i < state.length; i += 1) {
    const tile = state[i];
    if (tile === BLANK) continue;
    const here = rowCol(i);
    const there = rowCol(home[tile]);
    total += Math.abs(here.row - there.row) + Math.abs(here.col - there.col);
  }
  return total;
}

/** 화면에서 고른 이름(h0/h1/h2)으로 함수를 찾을 때 쓴다 */
export const HEURISTICS = Object.freeze({ h0, h1, h2 });

/** 이름으로 휴리스틱 함수 얻기. 모르는 이름이면 h2를 쓴다. */
export function getHeuristic(id) {
  return HEURISTICS[id] ?? h2;
}
