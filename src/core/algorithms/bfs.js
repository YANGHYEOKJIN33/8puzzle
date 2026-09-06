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

/** 화면에 보여 줄 의사코드. 줄 번호가 _graphSearch.js의 LINE·순서도 도형과 맞춰져 있다. */
export const pseudo = Object.freeze([
  'OPEN ← [시작 노드]              (큐: 먼저 들어온 것이 먼저 나간다)',
  'CLOSED ← 빈 집합',
  '반복: OPEN이 비어 있지 않은 동안',
  '    n ← OPEN의 맨 앞에서 꺼낸다',
  '    만약 n이 목표이면 → 성공: n까지의 경로를 돌려준다',
  '    n을 CLOSED에 넣고, n의 자식들을 만든다 (빈칸을 상·하·좌·우로 민다)',
  '    자식 중 OPEN에도 CLOSED에도 없는 것을 OPEN의 뒤에 넣는다',
  '실패: OPEN이 비었다 (해가 없다)',
]);

/**
 * 의사코드 "한 줄씩 읽기"(레슨 11쪽)에 쓰는 줄별 설명 — 각 줄이 하는 일과 왜 필요한지.
 * pseudo와 같은 길이·같은 순서. 코드를 처음 보는 학생이 "무슨 코드가 무슨 일을 하는지"
 * 를 빈칸 채우기 전에 익히도록 한다.
 */
export const notes = Object.freeze([
  '시작 배치 하나를 OPEN에 넣고 출발해요. OPEN은 앞으로 살펴볼 노드를 기다리게 하는 대기 목록이에요.',
  'CLOSED는 이미 살펴본 노드를 모으는 곳. 처음엔 비어 있어요 — 왜냐하면 아직 아무것도 안 봤으니까요.',
  'OPEN이 빌 때까지 되풀이해요. 컴퓨터는 한 번에 노드 하나씩만 펼치니까, 목표를 찾을 때까지 반복이 필요해요.',
  'OPEN의 맨 앞에서 노드를 꺼내요. "맨 앞"이 바로 이 알고리즘을 너비 우선으로 만드는 핵심(먼저 넣은 것 먼저).',
  '꺼낸 노드가 목표면 끝! 여기까지 온 길을 답으로 돌려줘요. 그래서 꺼내자마자 목표인지부터 확인해요.',
  '목표가 아니면 이 노드를 CLOSED에 넣어 "봤다"고 표시하고, 자식들을 만들어요(확장). 표시해 둬야 같은 배치를 또 안 봐요.',
  '새 자식 중 OPEN·CLOSED 어디에도 없는 것만 OPEN 뒤에 넣어요. 뒤에 넣어야 먼저 온 것이 먼저 나가요(FIFO).',
  'OPEN이 끝내 비면 더 볼 게 없다는 뜻 — 해가 없어요.',
]);

/**
 * @param {number[]} start  시작 상태
 * @param {object}   [options]
 * @param {number[]} [options.goal]         목표 상태
 * @param {function} [options.heuristic]    OPEN 항목의 참고용 h 표시에 쓴다
 * @param {number}   [options.limit]        확장한 노드 수 상한
 * @returns 단계 기록과 결과 (trace.js의 finish() 형식)
 */
export function run(start, options = {}) {
  const { goal = GOAL, heuristic = h2, limit = MAX_EXPANSIONS } = options;
  return graphSearch({ start, goal, heuristic, mode: 'queue', limit });
}
