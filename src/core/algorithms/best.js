/**
 * 최상 우선 탐색 (Best-First / Greedy) — 요구사항 3.2 (나) 6번.
 *
 * 평가값으로 h(n)만 본다. "지금 목표에 가장 가까워 보이는" 노드부터 확장한다.
 * 빠르게 목표로 돌진하지만, 여기까지 든 비용(g)을 무시하므로 최단 해는 보장하지 못한다.
 * A*와 나란히 두면 "g를 더하느냐 마느냐"의 차이가 결과를 어떻게 바꾸는지 보인다.
 */
import { prioritySearch } from './_priority.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { MAX_EXPANSIONS } from '../../app/config.js';

export const meta = Object.freeze({
  id: 'best', name: '최상 우선 탐색', en: 'Best-First Search', structure: 'priority',
});

export const pseudo = Object.freeze([
  'OPEN ← [시작 노드]              (우선순위 큐: h 가 작은 순서)',
  'CLOSED ← 빈 집합',
  '반복: OPEN이 비어 있지 않은 동안',
  '    n ← OPEN에서 h 가 가장 작은 노드를 꺼낸다',
  '    만약 n이 목표이면 → 성공: n까지의 경로를 돌려준다',
  '    n을 CLOSED에 넣고, n의 자식들을 만든다 (각자의 h를 잰다)',
  '    더 나은 자식을 h 순서에 맞게 OPEN에 끼워 넣는다',
  '실패: OPEN이 비었다',
]);

/** 의사코드 줄별 설명(레슨 11쪽). pseudo와 같은 길이. */
export const notes = Object.freeze([
  '시작 배치를 OPEN에 넣어요. 이 OPEN은 우선순위 큐 — 늘 h(남은 거리 어림값)가 작은 순서로 줄 서요.',
  'CLOSED는 이미 살펴본 노드를 모으는 곳. 처음엔 비어 있어요.',
  'OPEN이 빌 때까지 되풀이해요.',
  'h가 가장 작은 노드를 꺼내요 — "목표에 가장 가까워 보이는" 것부터 봐요. 그래서 목표로 빠르게 돌진해요.',
  '꺼낸 노드가 목표면 끝! 경로를 돌려줘요.',
  '목표가 아니면 CLOSED에 넣어 표시하고 자식들을 만들어, 자식마다 h를 재요.',
  '자식을 h 순서에 맞는 자리에 OPEN에 끼워 넣어요. 늘 정렬돼 있어야 맨 앞이 "가장 유망한 노드"가 돼요.',
  'OPEN이 비면 해가 없어요.',
]);

export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS } = options;
  return prioritySearch({
    start, goal, heuristic, limit,
    keyOf: (node) => node.h,   // h 만 본다
    evalLabel: 'h',
  });
}
