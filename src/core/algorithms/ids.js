/**
 * 반복적 깊이 심화 탐색 (Iterative Deepening Search) — 요구사항 3.2 (가) 4번.
 *
 * 깊이 한계를 0, 1, 2, … 로 하나씩 늘려가며 깊이 제한 탐색을 되풀이한다.
 * 얕은 곳을 여러 번 다시 보는 대신, 스택만 쓰므로 메모리는 깊이 우선처럼 적고,
 * 한계를 조금씩 늘리므로 처음 찾는 해가 가장 짧다 — 너비 우선의 최단성과
 * 깊이 우선의 적은 메모리를 함께 얻는다. 8-퍼즐에 실제로 쓸 만한 맹목적 탐색이다.
 */
import { boundedDfs } from './_depthLimited.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { Recorder } from '../trace.js';
import { MAX_EXPANSIONS } from '../../app/config.js';

export const meta = Object.freeze({
  id: 'ids', name: '반복적 깊이 심화 탐색', en: 'Iterative Deepening Search', structure: 'stack',
});

export const pseudo = Object.freeze([
  'L ← 0',
  '반복 (L 을 하나씩 늘리며):',
  '    깊이 한계 L 로 스택 기반 깊이 우선 탐색:',
  '        n ← OPEN의 맨 위에서 꺼낸다',
  '        만약 n이 목표이면 → 성공',
  '        n의 깊이 < L 이면 자식을 만들어 OPEN에 넣는다',
  '    L 안에 없으면 L 을 1 늘려 처음부터 다시',
]);

// 안쪽 깊이 제한 탐색의 프레임을 IDS 의사코드 줄에 맞춰 옮긴다
const LINES = { INIT: 3, POP: 4, GOAL: 5, LIMIT: 6, MAKE: 6, PUSH: 6, FAIL: 7 };
const MAX_L = 40;   // 안전 한계 (8-퍼즐 최적해는 최대 31)

export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS } = options;
  const rec = new Recorder();
  const budget = { limit };

  for (let L = 0; L <= MAX_L; L += 1) {
    if (L > 0) {
      rec.frame({
        line: LINES.FAIL, action: 'restart', current: null,
        openSize: 0, delta: { op: 'clear' }, closedSize: 0,
        narration: `깊이 한계 ${L - 1} 안에 없었습니다. 한계를 ${L} 로 늘려 처음부터 다시 시작합니다.`,
      });
    }
    const result = boundedDfs(rec, { start, goal, heuristic, maxDepth: L, budget, lines: LINES });
    if (result.found) return rec.finish({ solutionNode: result.node });
    if (result.stopped) return rec.finish({ reason: 'limit' });
  }

  rec.frame({
    line: LINES.FAIL, action: 'exhausted', current: null,
    openSize: 0, closedSize: 0,
    narration: `깊이 ${MAX_L} 까지 늘려도 해를 찾지 못했습니다.`,
  });
  return rec.finish({ reason: 'exhausted' });
}
