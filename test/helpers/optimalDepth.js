/**
 * 테스트 전용 참값 계산기.
 *
 * 너비 우선 탐색으로 "최소 몇 번 밀어야 하는가"를 구한다.
 * 사이트에서 쓰는 알고리즘(4단계 이후)과는 별개의 코드로 두어,
 * 나중에 만든 알고리즘이 내놓은 답을 이 값과 대조해 검증할 수 있게 한다.
 */
import { GOAL, expand, isGoal, isSolvable, key } from '../../src/core/puzzle.js';

/** 최소 이동 횟수. 풀 수 없는 상태면 null. */
export function optimalDepth(start, goal = GOAL, limit = 200000) {
  if (!isSolvable(start, goal)) return null;
  if (isGoal(start, goal)) return 0;

  const seen = new Set([key(start)]);
  let frontier = [start];
  let depth = 0;

  while (frontier.length > 0 && seen.size < limit) {
    depth += 1;
    const next = [];
    for (const state of frontier) {
      for (const move of expand(state)) {
        const k = key(move.state);
        if (seen.has(k)) continue;
        if (isGoal(move.state, goal)) return depth;
        seen.add(k);
        next.push(move.state);
      }
    }
    frontier = next;
  }
  return null;
}
