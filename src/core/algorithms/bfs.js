/**
 * 너비 우선 탐색 (Breadth-First Search) — 요구사항 3.2 (가) 1번.
 *
 * OPEN을 큐(먼저 들어온 것이 먼저 나감)로 쓴다. 얕은 곳부터 빠짐없이 훑으므로
 * 처음 만나는 해가 곧 가장 짧은 해다. 대신 OPEN이 크게 부풀어 메모리를 많이 쓴다.
 */
import { graphSearch } from './_graphSearch.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { MAX_EXPANSIONS } from '../../app/config.js';

export const meta = Object.freeze({
  id: 'bfs',
  name: '너비 우선 탐색',
  en: 'Breadth-First Search',
  structure: 'queue',
});

/** 화면에 보여 줄 의사코드. 줄 번호가 _graphSearch.js의 LINE과 맞춰져 있다. */
export const pseudo = Object.freeze([
  'OPEN ← [시작 노드]              (큐: 먼저 들어온 것이 먼저 나간다)',
  'CLOSED ← 빈 집합',
  '반복: OPEN이 비어 있지 않은 동안',
  '    n ← OPEN의 맨 앞에서 꺼낸다',
  '    만약 n이 목표이면 → 성공: n까지의 경로를 돌려준다',
  '    n을 CLOSED에 넣는다',
  '    n의 자식들을 만든다 (빈칸을 상·하·좌·우로 민다)',
  '    자식 중 OPEN에도 CLOSED에도 없는 것을 OPEN의 뒤에 넣는다',
  '실패: OPEN이 비었다 (해가 없다)',
]);

/**
 * @param {number[]} start  시작 상태
 * @param {object}   [options]
 * @param {number[]} [options.goal]         목표 상태
 * @param {function} [options.heuristic]    OPEN 항목의 참고용 h 표시에 쓴다
 * @param {number}   [options.limit]        펼친 노드 수 상한
 * @returns 단계 기록과 결과 (trace.js의 finish() 형식)
 */
export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS } = options;
  return graphSearch({ start, goal, heuristic, mode: 'queue', limit });
}
