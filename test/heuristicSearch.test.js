/**
 * 경험적 탐색과 깊이 제한 계열 검증 (요구사항 3.2 · 7.5.2).
 * 사이트 알고리즘의 답을 별개 코드의 참값(optimalDepth)과 대조한다.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { GOAL, expand, isGoal, key, shuffle } from '../src/core/puzzle.js';
import { h0, h1, h2 } from '../src/core/heuristics.js';
import { runAlgorithm } from '../src/core/algorithms/index.js';
import { openSequence } from '../src/core/trace.js';
import { optimalDepth } from './helpers/optimalDepth.js';

function seeded(seed) {
  return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
}
function assertValidPath(path, start, goal) {
  assert.deepEqual(path[0], start);
  assert.equal(isGoal(path[path.length - 1], goal), true);
  for (let i = 1; i < path.length; i += 1) {
    const nexts = expand(path[i - 1]).map((m) => key(m.state));
    assert.ok(nexts.includes(key(path[i])), `${i}번째 이동이 규칙에 맞는다`);
  }
}

test('A*는 허용적 휴리스틱으로 언제나 최단 해를 찾는다 (요구사항 3.2)', () => {
  const random = seeded(2024);
  for (let i = 0; i < 15; i += 1) {
    const start = shuffle(13, GOAL, random);
    const truth = optimalDepth(start);
    for (const heuristic of [h1, h2]) {
      const r = runAlgorithm('astar', start, { heuristic });
      assert.equal(r.solution.found, true);
      assert.equal(r.solution.moves, truth, `A*는 최단 ${truth}수를 찾는다`);
      assertValidPath(r.solution.path, start, GOAL);
    }
  }
});

test('A*에 h0을 주면 균일 비용 탐색이 되어도 여전히 최단이다', () => {
  const start = shuffle(11, GOAL, seeded(5));
  const r = runAlgorithm('astar', start, { heuristic: h0 });
  assert.equal(r.solution.moves, optimalDepth(start));
});

test('더 똑똑한 h2는 h1보다 노드를 적게 펼친다 (평균적으로)', () => {
  const random = seeded(7);
  let h2Fewer = 0;
  for (let i = 0; i < 12; i += 1) {
    const start = shuffle(12, GOAL, random);
    const e1 = runAlgorithm('astar', start, { heuristic: h1 }).stats.expanded;
    const e2 = runAlgorithm('astar', start, { heuristic: h2 }).stats.expanded;
    if (e2 <= e1) h2Fewer += 1;
  }
  assert.ok(h2Fewer >= 10, `대체로 h2가 더 적게 펼친다 (${h2Fewer}/12)`);
});

test('최상 우선 탐색은 해를 찾지만 최단은 보장하지 않는다', () => {
  const random = seeded(31);
  for (let i = 0; i < 12; i += 1) {
    const start = shuffle(10, GOAL, random);
    const r = runAlgorithm('best', start);
    if (r.solution.found) {
      assertValidPath(r.solution.path, start, GOAL);
      assert.ok(r.solution.moves >= optimalDepth(start), '최단보다 짧을 수는 없다');
    }
  }
});

test('반복적 깊이 심화 탐색은 최단 해를 찾는다 (요구사항 3.2)', () => {
  const random = seeded(88);
  for (let i = 0; i < 8; i += 1) {
    const start = shuffle(9, GOAL, random);
    const r = runAlgorithm('ids', start);
    assert.equal(r.solution.found, true);
    assert.equal(r.solution.moves, optimalDepth(start), 'IDS는 BFS처럼 최단이다');
    assertValidPath(r.solution.path, start, GOAL);
  }
});

test('깊이 제한 탐색은 한계보다 깊은 해를 찾지 못한다', () => {
  // 보통 예제(11수)를 깊이 한계 5로 풀면 실패해야 한다
  const start = [5, 8, 2, 1, 7, 3, 4, 0, 6];
  const shallow = runAlgorithm('dls', start, { maxDepth: 5 });
  assert.equal(shallow.solution.found, false);
  assert.equal(shallow.solution.reason, 'depth-limit');
  // 한계를 넉넉히 주면 찾는다
  const deep = runAlgorithm('dls', start, { maxDepth: 15 });
  assert.equal(deep.solution.found, true);
  assertValidPath(deep.solution.path, start, GOAL);
});

test('언덕 등반은 대개 지역 최적에 막힌다 (그 막힘이 교훈)', () => {
  const random = seeded(99);
  let stuck = 0;
  for (let i = 0; i < 30; i += 1) {
    const start = shuffle(20, GOAL, random);
    const r = runAlgorithm('hill', start);
    if (r.solution.reason === 'local-optimum') stuck += 1;
    if (r.solution.found) assertValidPath(r.solution.path, start, GOAL);
  }
  assert.ok(stuck >= 20, `대부분 지역 최적에 막힌다 (${stuck}/30)`);
});

test('우선순위 큐 OPEN은 평가값 오름차순으로 유지된다', () => {
  const start = shuffle(8, GOAL, seeded(3));
  const r = runAlgorithm('astar', start, { heuristic: h2 });
  const seq = openSequence(r.frames);
  for (let i = 0; i < r.frames.length; i += 1) {
    assert.equal(seq[i].length, r.frames[i].openSize, `${i}번 OPEN 크기 일치`);
    const fs = seq[i].map((id) => r.nodes[id].f);
    for (let j = 1; j < fs.length; j += 1) assert.ok(fs[j] >= fs[j - 1], 'f가 오름차순');
  }
});

test('삽입 델타로 되짚은 OPEN이 크기와 노드 등록소에 들어맞는다', () => {
  const r = runAlgorithm('best', shuffle(7, GOAL, seeded(4)));
  const seq = openSequence(r.frames);
  for (let i = 0; i < r.frames.length; i += 1) {
    assert.equal(seq[i].length, r.frames[i].openSize);
    for (const id of seq[i]) assert.ok(r.nodes[id]);
  }
});
