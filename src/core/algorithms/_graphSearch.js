/**
 * BFS와 DFS가 함께 쓰는 그래프 탐색 뼈대.
 *
 * 두 알고리즘은 제어 흐름이 똑같고, OPEN을 "앞에서 꺼내느냐(큐)"와
 * "위에서 꺼내느냐(스택)"만 다르다. 그래서 한 곳에 모아 두 곳이 어긋나지 않게 한다
 * (요구사항 7.5.3). 의사코드 줄 번호도 둘이 공유한다.
 *
 * 이 파일은 화면을 전혀 모른다. 오직 단계 기록(frame 목록)만 만든다.
 */
import { expand, isGoal, key } from '../puzzle.js';
import { Recorder } from '../trace.js';

/**
 * 의사코드 줄 번호 (1부터). BFS·DFS의 의사코드가 이 번호에 맞춰져 있다.
 * 화면은 프레임의 line 값으로 이 줄을 강조한다.
 */
export const LINE = Object.freeze({
  INIT: 1,   // OPEN ← [시작 노드]
  LOOP: 3,   // OPEN이 비어 있지 않은 동안 반복
  POP:  4,   // n ← OPEN에서 꺼낸다
  GOAL: 5,   // n이 목표라면 성공
  CLOSE: 6,  // n을 CLOSED에 넣는다
  MAKE: 7,   // n의 자식들을 만든다
  PUSH: 8,   // 자식을 OPEN에 넣는다 (이미 있으면 건너뛴다)
  FAIL: 9,   // OPEN이 비었다 → 실패
});

/**
 * @param {object}   options
 * @param {number[]} options.start      시작 상태
 * @param {number[]} options.goal       목표 상태
 * @param {function} options.heuristic  h(state) — OPEN 항목의 f 표시에 쓴다(맹목적 탐색도 참고로 계산)
 * @param {'queue'|'stack'} options.mode 큐면 BFS, 스택이면 DFS
 * @param {number}   options.limit      펼친 노드 수 상한 (요구사항 4.3.5)
 */
export function graphSearch({ start, goal, heuristic, mode, limit }) {
  const rec = new Recorder();
  const open = [];              // 노드 배열 — 큐이자 스택
  const seen = new Set();       // OPEN이나 CLOSED에 있는 상태들의 열쇠
  const closed = new Set();
  const isQueue = mode === 'queue';
  const structureName = isQueue ? '큐(FIFO)' : '스택(LIFO)';
  const takeEnd = isQueue ? 'front' : 'back';   // 큐는 앞에서, 스택은 위(뒤)에서 꺼낸다
  const takeWord = isQueue ? '맨 앞' : '맨 위';
  const putWord = isQueue ? '맨 뒤' : '맨 위';

  // 1: OPEN ← [시작 노드]
  const root = rec.node({ state: start, g: 0, h: heuristic(start) });
  open.push(root);
  seen.add(key(start));
  rec.frame({
    line: LINE.INIT, action: 'init', current: null,
    openSize: open.length, delta: { op: 'push', id: root.id, end: 'back' },
    highlight: root.id, closedSize: closed.size,
    narration: `시작 상태를 OPEN에 넣습니다. OPEN은 ${structureName}입니다.`,
  });

  // 3: OPEN이 비어 있지 않은 동안 반복
  while (open.length > 0) {
    // 4: n ← OPEN에서 꺼낸다 (큐는 앞에서, 스택은 위에서)
    const n = isQueue ? open.shift() : open.pop();
    rec.frame({
      line: LINE.POP, action: 'pop', current: n,
      openSize: open.length, delta: { op: 'pop', id: n.id, end: takeEnd },
      highlight: n.id, closedSize: closed.size,
      narration: `OPEN의 ${takeWord}에서 노드를 꺼냅니다. (깊이 ${n.depth})`,
    });

    // 5: n이 목표라면 성공
    if (isGoal(n.state, goal)) {
      rec.frame({
        line: LINE.GOAL, action: 'goal', current: n,
        openSize: open.length, closedSize: closed.size, highlight: n.id,
        narration: `목표에 도달했습니다! ${n.depth}번 밀어서 풀었습니다.`,
      });
      return rec.finish({ solutionNode: n });
    }

    // 6: n을 CLOSED에 넣는다
    closed.add(key(n.state));
    rec.countExpanded();

    // 상한에 닿으면 안전하게 멈춘다 (요구사항 4.3.5)
    if (rec.expanded >= limit) {
      rec.frame({
        line: LINE.CLOSE, action: 'limit', current: n,
        openSize: open.length, closedSize: closed.size,
        narration: `펼친 노드가 ${limit}개에 이르러 멈춥니다. 탐색 공간이 너무 큽니다.`,
      });
      return rec.finish({ reason: 'limit' });
    }

    // 7: n의 자식들을 만든다
    const children = expand(n.state);
    rec.frame({
      line: LINE.MAKE, action: 'make', current: n,
      openSize: open.length, closedSize: closed.size,
      narration: `n을 CLOSED에 넣고, 자식 ${children.length}개를 만듭니다.`,
    });

    // 8: 자식 중 OPEN에도 CLOSED에도 없는 것만 넣는다
    for (const move of children) {
      const k = key(move.state);
      if (seen.has(k)) {
        rec.frame({
          line: LINE.PUSH, action: 'skip', current: n,
          openSize: open.length, closedSize: closed.size,
          narration: `자식(${move.label})은 이미 OPEN이나 CLOSED에 있어 넣지 않습니다.`,
        });
        continue;
      }
      const child = rec.node({
        state: move.state, parent: n, g: n.g + 1,
        h: heuristic(move.state), moveLabel: move.label,
      });
      open.push(child);
      seen.add(k);
      rec.frame({
        line: LINE.PUSH, action: 'push', current: n,
        openSize: open.length, delta: { op: 'push', id: child.id, end: 'back' },
        highlight: child.id, closedSize: closed.size,
        narration: `자식(${move.label})을 OPEN의 ${putWord}에 넣습니다.`,
      });
    }
  }

  // 9: OPEN이 비었다 → 실패
  rec.frame({
    line: LINE.FAIL, action: 'exhausted', current: null,
    openSize: 0, closedSize: closed.size,
    narration: 'OPEN이 비었습니다. 더 볼 것이 없어 해를 찾지 못했습니다.',
  });
  return rec.finish({ reason: 'exhausted' });
}
