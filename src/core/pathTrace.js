/**
 * 학생이 돌려준 "해 경로"를 기존 재생기로 애니메이션하기 위한 어댑터 (요구사항 5.3.1·5.3.2).
 *
 * 학습 3단계에서는 학생의 파이썬 search()가 상태들의 목록(경로)을 돌려준다.
 * 그 경로를 trace.js가 내주는 결과 형식으로 감싸, 퍼즐 판·진행 막대·실행 제어를
 * 그대로 재사용해 한 걸음씩 재생할 수 있게 한다.
 *
 * 또한 경로가 규칙에 맞는지(연속된 이동인지, 목표에서 끝나는지) 검사해 준다.
 */
import { expand, isGoal, key } from './puzzle.js';
import { Recorder } from './trace.js';

/**
 * 경로가 유효한지 검사한다.
 * @returns {{ ok: boolean, reason?: string, at?: number }}
 */
export function validatePath(path, start, goal) {
  if (!Array.isArray(path) || path.length === 0) {
    return { ok: false, reason: 'empty' };
  }
  if (key(path[0]) !== key(start)) {
    return { ok: false, reason: 'start' };
  }
  for (let i = 1; i < path.length; i += 1) {
    const legal = expand(path[i - 1]).some((m) => key(m.state) === key(path[i]));
    if (!legal) return { ok: false, reason: 'move', at: i };
  }
  if (!isGoal(path[path.length - 1], goal)) {
    return { ok: false, reason: 'goal' };
  }
  return { ok: true };
}

/** 부모(직전 상태)와 견주어 이번에 움직인 칸을 찾는다 */
function movedCell(prev, state) {
  if (!prev) return -1;
  for (let i = 0; i < state.length; i += 1) {
    if (state[i] !== prev[i] && state[i] !== 0) return i;
  }
  return -1;
}

/**
 * 유효한 경로를 재생기가 쓰는 결과 형식으로 감싼다.
 * 각 프레임은 경로의 한 상태를 현재 노드로 보여 준다(OPEN/CLOSED는 쓰지 않는다).
 */
export function pathToResult(path) {
  const rec = new Recorder();
  let parent = null;
  const nodeList = [];

  path.forEach((state, i) => {
    const node = rec.node({ state, parent, g: i, h: 0, moveLabel: null });
    // parentState를 직전 상태로 채워 움직인 칸을 강조할 수 있게 한다
    node.parentState = parent ? parent.state : null;
    node.moved = movedCell(parent ? parent.state : null, state);
    nodeList.push(node);
    rec.frame({
      line: 0, action: i === path.length - 1 ? 'goal' : 'path', current: node,
      openSize: 0, closedSize: 0, highlight: node.id,
      narration: i === 0
        ? '시작 상태입니다.'
        : (i === path.length - 1
            ? `목표에 도달했습니다! 모두 ${path.length - 1}번 밀었습니다.`
            : `${i}번째 이동입니다.`),
    });
    parent = node;
  });

  return rec.finish({ solutionNode: nodeList[nodeList.length - 1] });
}
