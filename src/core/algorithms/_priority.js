/**
 * 최상 우선 탐색과 A*가 함께 쓰는 "우선순위 큐" 그래프 탐색 뼈대.
 *
 * OPEN을 평가값이 작은 순서로 늘 정렬해 둔다. 그래서 맨 앞이 언제나 "다음에 볼
 * 가장 유망한 노드"다. 두 알고리즘의 차이는 오직 평가값을 무엇으로 삼느냐뿐이다.
 *   최상 우선 : key = h(n)          (목표까지 남았다고 어림잡은 값만 본다)
 *   A*       : key = g(n) + h(n)    (여기까지 온 비용 + 남은 어림값)
 *
 * 화면(자료구조 패널)은 OPEN을 이 정렬된 순서 그대로 그려, 학생이 "가장 작은 것부터
 * 꺼낸다"를 눈으로 본다.
 */
import { expand, isGoal, key } from '../puzzle.js';
import { Recorder } from '../trace.js';

export const LINE = Object.freeze({
  INIT: 1,   // OPEN ← [시작 노드]
  LOOP: 3,   // OPEN이 비어 있지 않은 동안
  POP:  4,   // 평가값이 가장 작은 노드를 꺼낸다
  GOAL: 5,   // 목표인가
  CLOSE: 6,  // CLOSED에 넣는다
  MAKE: 7,   // 자식들을 만든다
  PUSH: 8,   // 자식을 평가값 자리에 끼워 넣는다
  FAIL: 9,
});

/**
 * @param {object}   o
 * @param {number[]} o.start
 * @param {number[]} o.goal
 * @param {function} o.heuristic  h(state)
 * @param {function} o.keyOf      노드 → 정렬 기준값 (작을수록 먼저)
 * @param {string}   o.evalLabel  화면·설명에 쓸 평가값 이름 ('f=g+h' 또는 'h')
 * @param {number}   o.limit      펼친 노드 수 상한
 */
export function prioritySearch({ start, goal, heuristic, keyOf, evalLabel, limit }) {
  const rec = new Recorder();
  const open = [];              // 노드 배열 — 언제나 key 오름차순 정렬 유지
  const bestG = new Map();      // 상태 → 지금까지 찾은 가장 작은 g
  const closed = new Set();

  /** open을 정렬 상태로 유지하며 node를 끼워 넣고, 넣은 자리(index)를 돌려준다 */
  function insertSorted(node) {
    const k = keyOf(node);
    let i = 0;
    while (i < open.length && keyOf(open[i]) <= k) i += 1;   // 같은 값이면 뒤에 (먼저 들어온 것 우선)
    open.splice(i, 0, node);
    return i;
  }

  const root = rec.node({ state: start, g: 0, h: heuristic(start) });
  bestG.set(key(start), 0);
  const rootIndex = insertSorted(root);
  rec.frame({
    line: LINE.INIT, action: 'init', current: null,
    openSize: open.length, delta: { op: 'insert', id: root.id, index: rootIndex },
    highlight: root.id, closedSize: closed.size,
    narration: `시작 상태를 OPEN에 넣습니다. OPEN은 ${evalLabel} 값이 작은 순서로 정렬됩니다.`,
  });

  while (open.length > 0) {
    const n = open.shift();   // 맨 앞 = 평가값이 가장 작은 노드
    rec.frame({
      line: LINE.POP, action: 'pop', current: n,
      openSize: open.length, delta: { op: 'pop', id: n.id, end: 'front' },
      highlight: n.id, closedSize: closed.size,
      narration: `OPEN에서 ${evalLabel}가 가장 작은 노드(${evalLabel}=${keyOf(n)})를 꺼냅니다.`,
    });

    // 더 좋은 길로 이미 펼친 상태면 건너뛴다 (오래된 중복)
    if (closed.has(key(n.state))) {
      rec.frame({
        line: LINE.POP, action: 'skip', current: n,
        openSize: open.length, closedSize: closed.size,
        narration: '이 상태는 더 나은 경로로 이미 펼쳤습니다. 건너뜁니다.',
      });
      continue;
    }

    if (isGoal(n.state, goal)) {
      rec.frame({
        line: LINE.GOAL, action: 'goal', current: n,
        openSize: open.length, closedSize: closed.size, highlight: n.id,
        narration: `목표에 도달했습니다! ${n.depth}번 밀어서 풀었습니다.`,
      });
      return rec.finish({ solutionNode: n });
    }

    closed.add(key(n.state));
    rec.countExpanded();

    if (rec.expanded >= limit) {
      rec.frame({
        line: LINE.CLOSE, action: 'limit', current: n,
        openSize: open.length, closedSize: closed.size,
        narration: `펼친 노드가 ${limit}개에 이르러 멈춥니다. 탐색 공간이 너무 큽니다.`,
      });
      return rec.finish({ reason: 'limit' });
    }

    const children = expand(n.state);
    rec.frame({
      line: LINE.MAKE, action: 'make', current: n,
      openSize: open.length, closedSize: closed.size,
      narration: `n을 CLOSED에 넣고, 자식 ${children.length}개를 만듭니다.`,
    });

    for (const move of children) {
      const k = key(move.state);
      const ng = n.g + 1;
      if (closed.has(k) || (bestG.has(k) && bestG.get(k) <= ng)) {
        rec.frame({
          line: LINE.PUSH, action: 'skip', current: n,
          openSize: open.length, closedSize: closed.size,
          narration: `자식(${move.label})은 더 낫지 않아 넣지 않습니다.`,
        });
        continue;
      }
      bestG.set(k, ng);
      const child = rec.node({ state: move.state, parent: n, g: ng, h: heuristic(move.state), moveLabel: move.label });
      const at = insertSorted(child);
      rec.frame({
        line: LINE.PUSH, action: 'push', current: n,
        openSize: open.length, delta: { op: 'insert', id: child.id, index: at },
        highlight: child.id, closedSize: closed.size,
        narration: `자식(${move.label}, ${evalLabel}=${keyOf(child)})을 평가값 순서에 맞는 자리에 끼워 넣습니다.`,
      });
    }
  }

  rec.frame({
    line: LINE.FAIL, action: 'exhausted', current: null,
    openSize: 0, closedSize: closed.size,
    narration: 'OPEN이 비었습니다. 해를 찾지 못했습니다.',
  });
  return rec.finish({ reason: 'exhausted' });
}
