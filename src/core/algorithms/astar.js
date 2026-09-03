/**
 * A* 알고리즘 — 요구사항 3.2 (나) 7번.
 *
 * 평가값 f(n) = g(n) + h(n)이 가장 작은 노드부터 확장한다.
 *   g(n) : 시작에서 여기까지 실제로 든 비용(= 깊이)
 *   h(n) : 여기서 목표까지의 어림값(휴리스틱)
 * h가 실제 거리를 넘겨 잡지 않으면(허용적) A*는 언제나 최단 해를 찾는다.
 * 휴리스틱으로 h0를 고르면 h가 늘 0이라, A*가 균일 비용 탐색과 똑같아진다.
 */
import { prioritySearch } from './_priority.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { MAX_EXPANSIONS } from '../../app/config.js';

export const meta = Object.freeze({
  id: 'astar', name: 'A* 알고리즘', en: 'A* Search', structure: 'priority',
});

export const pseudo = Object.freeze([
  'OPEN ← [시작 노드]              (우선순위 큐: f = g + h 가 작은 순서)',
  'CLOSED ← 빈 집합',
  '반복: OPEN이 비어 있지 않은 동안',
  '    n ← OPEN에서 f = g + h 가 가장 작은 노드를 꺼낸다',
  '    만약 n이 목표이면 → 성공: n까지의 경로를 돌려준다',
  '    n을 CLOSED에 넣는다',
  '    n의 자식들을 만든다 (g는 1 늘고, h를 새로 잰다)',
  '    더 나은 자식을 f 순서에 맞게 OPEN에 끼워 넣는다',
  '실패: OPEN이 비었다',
]);

export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS } = options;
  return prioritySearch({
    start, goal, heuristic, limit,
    keyOf: (node) => node.g + node.h,   // f = g + h
    evalLabel: 'f',
  });
}
