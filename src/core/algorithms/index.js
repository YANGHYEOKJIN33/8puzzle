/**
 * 알고리즘 등록소.
 *
 * 요구사항 7.5.3 — 새 알고리즘을 더할 때는 파일 하나를 만들고
 * 이 목록에 한 줄을 추가하면 된다. 화면 코드는 손대지 않는다.
 */
import * as bfs from './bfs.js';
import * as dfs from './dfs.js';

/** id → 알고리즘 모듈 (meta, pseudo, run) */
export const ALGORITHMS = Object.freeze({
  [bfs.meta.id]: bfs,
  [dfs.meta.id]: dfs,
});

/** 지금 탐색 엔진이 준비된 알고리즘의 id 목록 */
export const READY_IDS = Object.freeze(Object.keys(ALGORITHMS));

/** id로 알고리즘 모듈을 얻는다. 없으면 null. */
export function getAlgorithm(id) {
  return ALGORITHMS[id] ?? null;
}

/**
 * id로 탐색을 실행한다.
 * @returns trace.js finish() 형식의 결과, 준비 안 된 알고리즘이면 null
 */
export function runAlgorithm(id, start, options = {}) {
  const algo = getAlgorithm(id);
  return algo ? algo.run(start, options) : null;
}
