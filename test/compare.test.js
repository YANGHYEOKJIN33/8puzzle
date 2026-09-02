/** 알고리즘 비교 로직 검증 (요구사항 3.2.3) */
import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeRun, bestOf, COMPARABLE } from '../src/app/compare.js';
import { optimalDepth } from './helpers/optimalDepth.js';

const EASY = [1, 5, 2, 4, 0, 3, 7, 8, 6];   // 4수

test('비교 대상에 7가지가 모두 들어 있다', () => {
  assert.equal(COMPARABLE.length, 7);
  assert.ok(COMPARABLE.includes('bfs') && COMPARABLE.includes('astar'));
});

test('한 알고리즘의 지표를 뽑는다', () => {
  const r = summarizeRun('bfs', EASY);
  assert.equal(r.found, true);
  assert.equal(r.moves, optimalDepth(EASY));
  assert.ok(r.expanded > 0 && r.generated >= r.expanded);
  assert.ok(r.maxOpen > 0);
  assert.ok(r.frames > 0);
});

test('BFS·A*·IDS는 같은 최단 해 길이를 낸다', () => {
  const truth = optimalDepth(EASY);
  for (const id of ['bfs', 'astar', 'ids']) {
    assert.equal(summarizeRun(id, EASY).moves, truth, `${id} 최단`);
  }
});

test('A*(h2)는 BFS보다 적게 펼친다 (더 똑똑함)', () => {
  const bfs = summarizeRun('bfs', EASY);
  const astar = summarizeRun('astar', EASY, { heuristicId: 'h2' });
  assert.ok(astar.expanded <= bfs.expanded, `A*(${astar.expanded}) <= BFS(${bfs.expanded})`);
});

test('bestOf는 해를 찾은 행 중 열별 최소값을 고른다', () => {
  const rows = [
    { found: true, moves: 10, expanded: 500, maxOpen: 40 },
    { found: true, moves: 4, expanded: 20, maxOpen: 18 },
    { found: false, moves: null, expanded: 25000, maxOpen: 9000 },
  ];
  assert.deepEqual(bestOf(rows), { moves: 4, expanded: 20, maxOpen: 18 });
});

test('아무도 못 찾으면 best는 모두 null', () => {
  assert.deepEqual(bestOf([{ found: false, moves: null, expanded: 1, maxOpen: 1 }]),
    { moves: null, expanded: null, maxOpen: null });
});
