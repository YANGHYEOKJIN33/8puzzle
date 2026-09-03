/**
 * 깊이 제한 깊이 우선 탐색 "한 회"를 실행하는 공용 부품.
 * 깊이 제한 탐색(DLS)과 반복적 깊이 심화 탐색(IDS)이 함께 쓴다.
 *
 * 전역 방문표(CLOSED)를 쓰지 않고, "지금 내려온 경로의 조상"만 피한다.
 * 그래야 IDS가 회를 거듭하며 같은 상태를 다시 탐색할 수 있고, 깊이 한계 안에서
 * 트리로 b^L 개만 살펴 되돌아온다.
 */
import { expand, isGoal, key } from '../puzzle.js';

/** child.state가 부모 사슬(조상)에 이미 있으면 참 — 되돌이/제자리걸음을 막는다 */
function onPath(registry, node, stateKey) {
  let cur = node;
  while (cur) {
    if (key(cur.state) === stateKey) return true;
    cur = cur.parent === null ? null : registry.get(cur.parent);
  }
  return false;
}

/**
 * 한 회의 깊이 제한 DFS를 rec에 기록한다.
 * @returns {{ found: boolean, node: object|null, stopped: boolean }}
 *          stopped=true 는 펼침 상한(budget)에 걸려 중단됐다는 뜻.
 */
export function boundedDfs(rec, { start, goal, heuristic, maxDepth, budget, lines }) {
  const open = [];
  const root = rec.node({ state: start, g: 0, h: heuristic(start) });
  open.push(root);
  rec.frame({
    line: lines.INIT, action: 'init', current: null,
    openSize: open.length, delta: { op: 'push', id: root.id, end: 'back' },
    highlight: root.id, closedSize: 0,
    narration: `깊이 한계 ${maxDepth} 로 시작 상태를 OPEN(스택)에 넣습니다.`,
  });

  while (open.length > 0) {
    const n = open.pop();
    rec.frame({
      line: lines.POP, action: 'pop', current: n,
      openSize: open.length, delta: { op: 'pop', id: n.id, end: 'back' },
      highlight: n.id, closedSize: 0,
      narration: `OPEN의 맨 위에서 노드를 꺼냅니다. (깊이 ${n.depth} / 한계 ${maxDepth})`,
    });

    if (isGoal(n.state, goal)) {
      rec.frame({
        line: lines.GOAL, action: 'goal', current: n,
        openSize: open.length, closedSize: 0, highlight: n.id,
        narration: `목표에 도달했습니다! ${n.depth}번 밀어서 풀었습니다.`,
      });
      return { found: true, node: n, stopped: false };
    }

    rec.countExpanded();
    if (budget.limit !== Infinity && rec.expanded >= budget.limit) {
      rec.frame({
        line: lines.POP, action: 'limit', current: n,
        openSize: open.length, closedSize: 0,
        narration: `확장한 노드가 ${budget.limit}개에 이르러 멈춥니다. 탐색 공간이 너무 큽니다.`,
      });
      return { found: false, node: null, stopped: true };
    }

    // 깊이 한계에 닿았으면 더 내려가지 않는다
    if (n.depth >= maxDepth) {
      rec.frame({
        line: lines.LIMIT, action: 'skip', current: n,
        openSize: open.length, closedSize: 0,
        narration: `깊이 한계(${maxDepth})에 닿아 더 내려가지 않고 되돌아갑니다.`,
      });
      continue;
    }

    const children = expand(n.state);
    rec.frame({
      line: lines.MAKE, action: 'make', current: n,
      openSize: open.length, closedSize: 0,
      narration: `자식 ${children.length}개를 만듭니다. (경로에 이미 있는 것은 뺍니다)`,
    });

    // 스택이라 나중에 넣은 것을 먼저 꺼낸다. 순서를 유지하려 뒤집어 넣는다.
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const move = children[i];
      if (onPath(rec.registry, n, key(move.state))) {
        rec.frame({
          line: lines.PUSH, action: 'skip', current: n,
          openSize: open.length, closedSize: 0,
          narration: `자식(${move.label})은 지금 경로에 이미 있어 넣지 않습니다.`,
        });
        continue;
      }
      const child = rec.node({ state: move.state, parent: n, g: n.g + 1, h: heuristic(move.state), moveLabel: move.label });
      open.push(child);
      rec.frame({
        line: lines.PUSH, action: 'push', current: n,
        openSize: open.length, delta: { op: 'push', id: child.id, end: 'back' },
        highlight: child.id, closedSize: 0,
        narration: `자식(${move.label})을 OPEN의 위에 넣습니다.`,
      });
    }
  }

  return { found: false, node: null, stopped: false };
}
