/**
 * 깊이 제한 탐색 (Depth-Limited Search) — 요구사항 3.2 (가) 3번.
 *
 * 깊이 우선 탐색에 "여기까지만 내려간다"는 깊이 한계 L을 둔 것이다.
 * 한계 덕분에 무한히 파고드는 일이 없다. 대신 L이 해의 깊이보다 작으면 찾지 못하고,
 * 너무 크면 여전히 많이 헤맨다. 이 딜레마가 다음 알고리즘(반복적 깊이 심화)의 동기다.
 */
import { boundedDfs } from './_depthLimited.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { Recorder } from '../trace.js';
import { MAX_EXPANSIONS } from '../../app/config.js';

/** 기본 깊이 한계 — 예제(쉬움 4·보통 11)는 풀되, 무한정 헤매지 않는 값 */
export const DEFAULT_MAX_DEPTH = 12;

export const meta = Object.freeze({
  id: 'dls', name: '깊이 제한 탐색', en: 'Depth-Limited Search', structure: 'stack',
});

export const pseudo = Object.freeze([
  'OPEN ← [시작 노드]              (스택 · 깊이 한계 L)',
  'CLOSED 대신, 지금 경로의 조상만 피한다',
  '반복: OPEN이 비어 있지 않은 동안',
  '    n ← OPEN의 맨 위에서 꺼낸다',
  '    만약 n이 목표이면 → 성공',
  '    만약 n의 깊이 < L 이면:',
  '        자식들을 만들어 (경로에 없는 것만)',
  '        OPEN의 위에 넣는다',
  '실패: 깊이 L 안에 해가 없다',
]);

const LINES = { INIT: 1, POP: 4, GOAL: 5, LIMIT: 6, MAKE: 7, PUSH: 8, FAIL: 9 };

export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS, maxDepth = DEFAULT_MAX_DEPTH } = options;
  const rec = new Recorder();
  const result = boundedDfs(rec, { start, goal, heuristic, maxDepth, budget: { limit }, lines: LINES });

  if (result.found) return rec.finish({ solutionNode: result.node });
  if (result.stopped) return rec.finish({ reason: 'limit' });

  rec.frame({
    line: LINES.FAIL, action: 'exhausted', current: null,
    openSize: 0, closedSize: 0,
    narration: `깊이 한계 ${maxDepth} 안에서는 해를 찾지 못했습니다. 한계를 늘려야 합니다.`,
  });
  return rec.finish({ reason: 'depth-limit' });
}
