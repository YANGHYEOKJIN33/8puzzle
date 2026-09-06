/**
 * 깊이 우선 탐색 (Depth-First Search) — 요구사항 3.2 (가) 2번.
 *
 * OPEN을 스택(마지막에 넣은 것을 먼저 꺼냄)으로 쓴다. 한 갈래를 끝까지 파고들어
 * OPEN이 얇게 유지되어 메모리를 적게 쓴다. 대신 처음 찾은 해가 가장 짧다는 보장이 없다.
 *
 * 코드가 BFS와 똑같아 보이는데 결과가 크게 다른 이유는 오직 하나 —
 * "OPEN에서 어느 쪽 끝을 꺼내느냐"뿐이다. 학생이 이 한 가지 차이를 눈으로 보게 한다.
 */
import { graphSearch } from './_graphSearch.js';
import { h2 } from '../heuristics.js';
import { GOAL } from '../puzzle.js';
import { MAX_EXPANSIONS } from '../../app/config.js';

export const meta = Object.freeze({
  id: 'dfs',
  name: '깊이 우선 탐색',
  en: 'Depth-First Search',
  structure: 'stack',
});

export const pseudo = Object.freeze([
  'OPEN ← [시작 노드]              (스택: 마지막에 넣은 것을 먼저 꺼낸다)',
  'CLOSED ← 빈 집합',
  '반복: OPEN이 비어 있지 않은 동안',
  '    n ← OPEN의 맨 위에서 꺼낸다',
  '    만약 n이 목표이면 → 성공: n까지의 경로를 돌려준다',
  '    n을 CLOSED에 넣고, n의 자식들을 만든다 (빈칸을 상·하·좌·우로 민다)',
  '    자식 중 OPEN에도 CLOSED에도 없는 것을 OPEN의 위에 넣는다',
  '실패: OPEN이 비었다 (해가 없다)',
]);

/** 의사코드 줄별 설명(레슨 11쪽). pseudo와 같은 길이. BFS와 딱 한 줄(꺼내는 곳)만 다르다. */
export const notes = Object.freeze([
  '시작 배치 하나를 OPEN에 넣고 출발해요. 여기서 OPEN은 스택 — 마지막에 넣은 것을 먼저 꺼내요.',
  'CLOSED는 이미 살펴본 노드를 모으는 곳. 처음엔 비어 있어요.',
  'OPEN이 빌 때까지 되풀이해요. 한 번에 노드 하나씩만 펼치니까요.',
  'OPEN의 맨 위에서 노드를 꺼내요. "맨 위"가 이 알고리즘을 깊이 우선으로 만들어요(마지막에 넣은 것 먼저 → 한 갈래로 깊이).',
  '꺼낸 노드가 목표면 끝! 여기까지 온 길을 답으로 돌려줘요.',
  '목표가 아니면 CLOSED에 넣어 표시하고 자식들을 만들어요(확장). 표시해 둬야 같은 배치를 또 안 봐요.',
  '새 자식 중 어디에도 없는 것만 OPEN의 위에 넣어요. 위에 넣으니 방금 만든 자식이 바로 다음에 나가요(LIFO → 깊이 파고듦).',
  'OPEN이 비면 더 볼 게 없다는 뜻 — 해가 없어요.',
]);

export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS } = options;
  return graphSearch({ start, goal, heuristic, mode: 'stack', limit });
}
