/**
 * 알고리즘 비교 (요구사항 3.2.3).
 * 같은 초기 상태에 대해 여러 알고리즘을 돌려 성능 지표를 나란히 모은다.
 * 화면을 모르는 순수 로직 — comparePanel이 이 결과를 표로 그린다.
 */
import { runAlgorithm, READY_IDS } from '../core/algorithms/index.js';
import { ALGORITHMS, MAX_EXPANSIONS } from './config.js';
import { getHeuristic } from '../core/heuristics.js';
import { findById } from './state.js';

/** 비교에 넣을 알고리즘 순서 (맹목적 → 경험적, config 순서 그대로) */
export const COMPARABLE = ALGORITHMS.filter((a) => READY_IDS.includes(a.id)).map((a) => a.id);

/** 한 알고리즘을 돌려 지표만 뽑는다 */
export function summarizeRun(id, start, { heuristicId = 'h2', limit = MAX_EXPANSIONS } = {}) {
  const algo = findById(ALGORITHMS, id);
  const result = runAlgorithm(id, start, { heuristic: getHeuristic(heuristicId), limit });
  const s = result.solution;
  return {
    id,
    name: algo.name,
    family: algo.family,
    found: s.found,
    reason: s.reason,
    moves: s.found ? s.moves : null,        // 해의 길이
    expanded: result.stats.expanded,        // 확장한 노드 수
    generated: result.stats.generated,      // 생성한 노드 수
    maxOpen: result.stats.maxOpen,          // OPEN 최대 크기
    frames: result.stats.frames,            // 소요 단계
  };
}

/**
 * 열마다 "가장 좋은" 값을 찾아 표시에 쓴다 (해를 찾은 행들만 대상).
 * moves·expanded·maxOpen 은 작을수록 좋다.
 * @returns {{ moves: number|null, expanded: number|null, maxOpen: number|null }}
 */
export function bestOf(rows) {
  const found = rows.filter((r) => r.found);
  const min = (key) => (found.length ? Math.min(...found.map((r) => r[key])) : null);
  return { moves: min('moves'), expanded: min('expanded'), maxOpen: min('maxOpen') };
}
