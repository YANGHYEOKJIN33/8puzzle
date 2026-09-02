/**
 * 언덕 등반 (Hill Climbing) — 요구사항 3.2 (나) 5번.
 *
 * OPEN을 두지 않는 국소 탐색이다. 지금 상태의 이웃들만 보고, 그중 h가 가장 작은
 * (목표에 가장 가까워 보이는) 이웃으로 한 걸음 옮긴다. 더 나은 이웃이 없으면
 * 거기서 멈춘다 — 그곳이 진짜 목표가 아니어도(지역 최적/평지) 되돌아가지 않는다.
 * 8-퍼즐에서는 자주 막히는데, 그 "막힘"을 눈으로 보는 것이 이 알고리즘의 교훈이다.
 *
 * 화면에서는 매 걸음 이웃 후보들을 OPEN 자리에 잠깐 보여 주고(각자의 h와 함께),
 * 고른 이웃을 강조한 뒤 그리로 옮긴다.
 */
import { expand, isGoal, key } from '../puzzle.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { Recorder } from '../trace.js';

export const meta = Object.freeze({
  id: 'hill', name: '언덕 등반', en: 'Hill Climbing', structure: 'single',
});

export const pseudo = Object.freeze([
  '현재 ← 시작 노드',
  '반복:',
  '    만약 현재가 목표이면 → 성공',
  '    이웃들을 만들고 각자의 h를 잰다',
  '    가장 h가 작은 이웃을 고른다',
  '    만약 그 이웃의 h가 현재보다 작지 않으면 → 멈춘다 (지역 최적)',
  '    현재 ← 그 이웃',
]);

const LINE = { START: 1, GOAL: 3, MAKE: 4, CHOOSE: 5, STUCK: 6, MOVE: 7 };

export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = 200 } = options;
  const rec = new Recorder();

  let current = rec.node({ state: start, g: 0, h: heuristic(start) });
  rec.frame({
    line: LINE.START, action: 'init', current,
    openSize: 0, closedSize: 0,
    narration: `시작 상태에서 출발합니다. 지금 h=${current.h} 입니다.`,
  });

  let steps = 0;
  while (steps < limit) {
    steps += 1;

    // 3: 목표인가?
    if (isGoal(current.state, goal)) {
      rec.frame({
        line: LINE.GOAL, action: 'goal', current,
        openSize: 0, closedSize: 0, highlight: current.id,
        narration: `목표에 도달했습니다! ${current.depth}번 만에 올라왔습니다.`,
      });
      return rec.finish({ solutionNode: current });
    }

    // 4: 이웃들을 만들고 h를 잰다 — OPEN 자리에 후보로 잠깐 보여 준다
    const neighbors = expand(current.state).map((move) =>
      rec.node({ state: move.state, parent: current, g: current.g + 1, h: heuristic(move.state), moveLabel: move.label }));

    neighbors.forEach((nb, i) => {
      rec.frame({
        line: LINE.MAKE, action: 'push', current,
        openSize: i + 1, delta: { op: 'insert', id: nb.id, index: i },
        highlight: nb.id, closedSize: 0,
        narration: `이웃(${nb.moveLabel})의 h=${nb.h} 를 잽니다.`,
      });
    });

    // 5: 가장 h가 작은 이웃을 고른다
    let best = neighbors[0];
    for (const nb of neighbors) if (nb.h < best.h) best = nb;
    rec.frame({
      line: LINE.CHOOSE, action: 'pop', current: best,
      openSize: neighbors.length, highlight: best.id, closedSize: 0,
      narration: `이웃 중 h가 가장 작은 것(h=${best.h})을 고릅니다.`,
    });

    // 6: 개선이 없으면 멈춘다 (지역 최적)
    if (best.h >= current.h) {
      rec.frame({
        line: LINE.STUCK, action: 'exhausted', current,
        openSize: neighbors.length, closedSize: 0,
        narration: `어느 이웃도 지금(h=${current.h})보다 낫지 않습니다. 지역 최적에 막혀 멈춥니다.`,
      });
      return rec.finish({ reason: 'local-optimum' });
    }

    // 7: 현재 ← 그 이웃 (나머지 후보는 버린다 — OPEN 비우기)
    rec.countExpanded();
    rec.frame({
      line: LINE.MOVE, action: 'make', current: best,
      openSize: 0, delta: { op: 'clear' }, highlight: best.id, closedSize: 0,
      narration: `그 이웃으로 옮깁니다. h가 ${current.h} → ${best.h} 로 낮아졌습니다.`,
    });
    current = best;
  }

  rec.frame({
    line: LINE.STUCK, action: 'limit', current,
    openSize: 0, closedSize: 0,
    narration: `걸음 수 상한(${limit})에 이르러 멈춥니다.`,
  });
  return rec.finish({ reason: 'limit' });
}
