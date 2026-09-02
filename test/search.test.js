/**
 * 탐색 알고리즘과 단계 기록 검증 (요구사항 3.2 · 7.5.2).
 *
 * 핵심 대조: 사이트의 알고리즘이 내놓은 답을, 별개 코드로 짠 참값(optimalDepth)과 맞춰 본다.
 *
 * DFS에 대하여 — 8-퍼즐에서 전역 방문표를 쓰는 그래프 탐색 DFS는 얕은 문제도
 * 상한까지 헤매다 포기한다. 이는 버그가 아니라 DFS의 본래 약점이며,
 * 뒤에 배울 깊이 제한 탐색·반복적 깊이 심화가 필요한 이유다. 테스트도 그대로 확인한다.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { GOAL, expand, isGoal, isSolvable, key, shuffle } from '../src/core/puzzle.js';
import { h2 } from '../src/core/heuristics.js';
import { runAlgorithm, READY_IDS } from '../src/core/algorithms/index.js';
import * as bfs from '../src/core/algorithms/bfs.js';
import * as dfs from '../src/core/algorithms/dfs.js';
import { openSequence } from '../src/core/trace.js';
import { optimalDepth } from './helpers/optimalDepth.js';

/** 씨앗을 주면 늘 같은 난수를 내는 생성기 — 테스트가 흔들리지 않게 한다 */
function seeded(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
}

/** 해 경로가 실제로 시작→목표로 이어지는 올바른 이동의 연속인지 확인한다 */
function assertValidPath(path, start, goal) {
  assert.deepEqual(path[0], start, '경로는 시작 상태에서 출발한다');
  assert.equal(isGoal(path[path.length - 1], goal), true, '경로는 목표 상태에서 끝난다');
  for (let i = 1; i < path.length; i += 1) {
    const nexts = expand(path[i - 1]).map((move) => key(move.state));
    assert.ok(nexts.includes(key(path[i])), `${i}번째 이동이 규칙에 맞는다`);
  }
}

test('등록소에 BFS와 DFS가 준비되어 있다', () => {
  assert.deepEqual([...READY_IDS].sort(), ['bfs', 'dfs']);
});

test('BFS 의사코드와 DFS 의사코드는 줄 수가 같다 (같은 뼈대)', () => {
  assert.equal(bfs.pseudo.length, dfs.pseudo.length);
  assert.equal(bfs.pseudo.length, 9);
});

test('이미 목표인 상태는 0번 밀어 푼다 (BFS·DFS 모두)', () => {
  for (const id of ['bfs', 'dfs']) {
    const result = runAlgorithm(id, [...GOAL]);
    assert.equal(result.solution.found, true);
    assert.equal(result.solution.moves, 0);
    assert.equal(result.frames.at(-1).action, 'goal');
    assertValidPath(result.solution.path, [...GOAL], GOAL);
  }
});

test('BFS는 언제나 최단 해를 찾는다 (참값과 일치)', () => {
  const random = seeded(2024);
  for (let i = 0; i < 20; i += 1) {
    const start = shuffle(12, GOAL, random);
    const truth = optimalDepth(start);
    const result = runAlgorithm('bfs', start);
    assert.equal(result.solution.found, true, `해를 찾는다: ${start}`);
    assert.equal(result.solution.moves, truth, `최단 ${truth}수와 일치: ${start}`);
    assertValidPath(result.solution.path, start, GOAL);
  }
});

test('BFS는 준비된 예제(쉬움·보통)를 정확한 수로 푼다', () => {
  assert.equal(runAlgorithm('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]).solution.moves, 4);
  assert.equal(runAlgorithm('bfs', [5, 8, 2, 1, 7, 3, 4, 0, 6]).solution.moves, 11);
});

test('DFS는 8-퍼즐에서 상한까지 헤매다 멈춘다 (본래 약점 · 요구사항 4.3.5)', () => {
  // 목표에서 단 한 번 민 상태인데도 전역 방문표 DFS는 상한 안에 못 찾는다
  const oneMove = expand([...GOAL])[0].state;
  const result = runAlgorithm('dfs', oneMove, { limit: 500 });
  assert.equal(result.solution.found, false);
  assert.equal(result.solution.reason, 'limit');
  assert.equal(result.stats.expanded, 500, '정확히 상한만큼만 펼친다');
  assert.equal(result.frames.at(-1).action, 'limit');
});

test('DFS는 BFS보다 훨씬 깊은 곳까지 내려간다 (스택의 성격)', () => {
  const start = [5, 8, 2, 1, 7, 3, 4, 0, 6];
  const bfsMaxDepth = Math.max(...runAlgorithm('bfs', start).frames.map((f) => f.counters.depth));
  const dfsMaxDepth = Math.max(...runAlgorithm('dfs', start, { limit: 500 }).frames.map((f) => f.counters.depth));
  assert.ok(dfsMaxDepth > bfsMaxDepth, `DFS(${dfsMaxDepth}) > BFS(${bfsMaxDepth})`);
});

test('해가 없는 배치는 해를 찾지 못한다 (요구사항 3.1.2)', () => {
  // 두 타일만 뒤바뀐, 절대 못 푸는 배치. isSolvable로 입력 시점에 미리 거를 수 있다.
  const start = [1, 2, 3, 4, 5, 6, 8, 7, 0];
  assert.equal(isSolvable(start), false);
  // 못 푸는 쪽 상태 공간이 9만 개가 넘어, 기본 상한(20000)에서 먼저 멈춘다.
  const result = runAlgorithm('bfs', start);
  assert.equal(result.solution.found, false, '해를 찾지 못한다');
  assert.equal(result.solution.reason, 'limit');
});

test('OPEN이 완전히 비면 실패로 끝난다 (exhausted 경로)', () => {
  // 상한을 넉넉히 두고 작은 예제로 exhausted 자체를 확인하기는 어려우므로,
  // 해가 없는 배치를 상한 없이 끝까지 돌려 OPEN이 비는 경로를 직접 확인한다.
  const start = [1, 2, 3, 4, 5, 6, 8, 7, 0];
  const result = runAlgorithm('bfs', start, { limit: Infinity });
  assert.equal(result.solution.found, false);
  assert.equal(result.solution.reason, 'exhausted');
  assert.equal(result.frames.at(-1).action, 'exhausted');
});

test('OPEN(큐)은 BFS에서 먼저 들어온 것이 먼저 빠진다 (FIFO)', () => {
  // 가운데가 빈칸이라 첫 확장에서 자식 4개가 차례로 OPEN 뒤에 붙는다
  const result = runAlgorithm('bfs', [1, 2, 3, 4, 0, 5, 6, 7, 8]);
  const pushes = result.frames.filter((f) => f.action === 'push');
  const pops = result.frames.filter((f) => f.action === 'pop');
  // 두 번째로 꺼내는 것은 첫 확장에서 '맨 처음' 넣은 자식이다
  assert.equal(pops[1].currentId, pushes[0].highlight, 'BFS는 먼저 들어온 것을 먼저 꺼낸다');
});

test('OPEN(스택)은 DFS에서 마지막에 넣은 것이 먼저 빠진다 (LIFO)', () => {
  const result = runAlgorithm('dfs', [1, 2, 3, 4, 0, 5, 6, 7, 8], { limit: 10 });
  const pushes = result.frames.filter((f) => f.action === 'push');
  const pops = result.frames.filter((f) => f.action === 'pop');
  // 첫 확장에서 자식 4개(pushes[0..3])를 넣은 뒤, 두 번째로 꺼내는 것은 '맨 마지막' 자식이다
  assert.equal(pops[1].currentId, pushes[3].highlight, 'DFS는 마지막에 넣은 것을 먼저 꺼낸다');
});

test('델타로 되짚은 OPEN이 크기와 일치한다 (요구사항 4.3.1 되감기의 토대)', () => {
  const result = runAlgorithm('bfs', shuffle(7, GOAL, seeded(5)));
  const sequence = openSequence(result.frames);
  assert.equal(sequence.length, result.frames.length);
  for (let i = 0; i < result.frames.length; i += 1) {
    assert.equal(sequence[i].length, result.frames[i].openSize, `${i}번 프레임 OPEN 크기 일치`);
    for (const id of sequence[i]) {
      assert.ok(result.nodes[id], `OPEN의 노드 ${id}가 등록소에 있다`);
    }
  }
});

test('펼친 노드 수 상한에 정확히 멈춘다 (요구사항 4.3.5)', () => {
  const start = [8, 6, 7, 2, 5, 4, 3, 0, 1];
  const result = runAlgorithm('bfs', start, { limit: 50 });
  assert.equal(result.solution.found, false);
  assert.equal(result.solution.reason, 'limit');
  assert.equal(result.stats.expanded, 50);
});

test('카운터가 앞으로 갈수록 줄지 않는다 (요구사항 4.2.5)', () => {
  const result = runAlgorithm('bfs', shuffle(8, GOAL, seeded(9)));
  let gen = 0;
  let exp = 0;
  let max = 0;
  for (const frame of result.frames) {
    assert.ok(frame.counters.generated >= gen);
    assert.ok(frame.counters.expanded >= exp);
    assert.ok(frame.counters.maxOpen >= max);
    ({ generated: gen, expanded: exp, maxOpen: max } = frame.counters);
  }
  assert.equal(result.stats.generated, gen);
});

test('현재 노드와 OPEN의 모든 id를 등록소에서 찾을 수 있다 (화면이 state를 그린다)', () => {
  const result = runAlgorithm('bfs', shuffle(6, GOAL, seeded(5)));
  for (const frame of result.frames) {
    if (frame.currentId !== null) assert.ok(result.nodes[frame.currentId]);
    if (frame.highlight !== null) assert.ok(result.nodes[frame.highlight]);
  }
});

test('모든 프레임의 강조 줄 번호가 의사코드 범위 안에 있고 설명이 있다 (요구사항 3.3.2 · 5.1.1)', () => {
  const result = runAlgorithm('bfs', shuffle(7, GOAL, seeded(3)));
  for (const frame of result.frames) {
    assert.ok(frame.line >= 1 && frame.line <= bfs.pseudo.length, `줄 ${frame.line}이 범위 안`);
    assert.equal(typeof frame.narration, 'string');
    assert.ok(frame.narration.length > 0);
  }
});

test('휴리스틱을 넘겨주면 노드의 f = g + h가 채워진다 (뒤에 올 A* 준비)', () => {
  const start = shuffle(6, GOAL, seeded(11));
  const result = runAlgorithm('bfs', start, { heuristic: h2 });
  // 노드 id는 실행마다 이어서 매겨지므로 0번이 루트라고 볼 수 없다. 부모 없는 노드를 찾는다.
  const root = Object.values(result.nodes).find((node) => node.parent === null);
  assert.equal(root.g, 0);
  assert.equal(root.h, h2(start));
  assert.equal(root.f, root.g + root.h);
});
