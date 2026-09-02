/**
 * 재생기 검증 (요구사항 4.3 · 4.3.1).
 * 브라우저 없이 재생기의 장면 계산·앞뒤 이동만 확인한다(DOM을 쓰지 않는다).
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { createStore } from '../src/app/state.js';
import { createPlayer } from '../src/app/player.js';
import { openSequence } from '../src/core/trace.js';

function freshPlayer() {
  const store = createStore();
  return { store, player: createPlayer(store) };
}

test('실으면 첫 장면(init)에서 시작한다', () => {
  const { player } = freshPlayer();
  player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  const v = player.view();
  assert.equal(v.empty, false);
  assert.equal(v.index, 0);
  assert.equal(v.atStart, true);
  assert.equal(v.frame.action, 'init');
});

test('한 단계 앞으로·뒤로가 정확히 오간다 (요구사항 4.3.1)', () => {
  const { player } = freshPlayer();
  player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  player.step(1); player.step(1);
  assert.equal(player.view().index, 2);
  player.step(-1);
  assert.equal(player.view().index, 1);
});

test('처음 이전·끝 이후로는 넘어가지 않는다', () => {
  const { player } = freshPlayer();
  player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  player.step(-1);
  assert.equal(player.view().index, 0, '처음에서 뒤로는 그대로');
  player.skipToEnd();
  const end = player.view();
  assert.equal(end.atEnd, true);
  player.step(1);
  assert.equal(player.view().index, end.index, '끝에서 앞으로는 그대로');
});

test('해까지 건너뛰면 마지막 장면이 목표 도달이다', () => {
  const { player } = freshPlayer();
  player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  player.skipToEnd();
  const v = player.view();
  assert.equal(v.finished, true);
  assert.equal(v.action, 'goal');
  assert.equal(v.solution.found, true);
  assert.equal(v.solution.moves, 4);
});

test('처음으로 누르면 첫 장면으로 돌아온다', () => {
  const { player } = freshPlayer();
  player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  player.skipToEnd();
  player.reset();
  assert.equal(player.view().index, 0);
  assert.equal(player.view().atStart, true);
});

test('재생기가 계산한 OPEN이 기록의 델타와 일치한다', () => {
  const { player } = freshPlayer();
  const result = player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  const reference = openSequence(result.frames);
  for (let i = 0; i < result.frames.length; i += 1) {
    player.reset();
    for (let s = 0; s < i; s += 1) player.step(1);
    assert.deepEqual(player.view().openIds, reference[i], `${i}번 장면 OPEN 일치`);
  }
});

test('해 경로 위의 노드 집합을 알려 준다 (요구사항 4.3.4)', () => {
  const { player } = freshPlayer();
  const result = player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  player.skipToEnd();
  const { pathIds } = player.view();
  assert.equal(pathIds.size, result.solution.path.length, '경로 길이만큼의 노드가 있다');
  assert.ok(pathIds.has(result.solution.node.id), '목표 노드가 경로에 있다');
});

test('구독하면 즉시 현재 장면을 받고, 이동 때마다 다시 받는다', () => {
  const { player } = freshPlayer();
  player.loadWith('bfs', [1, 5, 2, 4, 0, 3, 7, 8, 6]);
  const seen = [];
  const off = player.subscribe((v) => seen.push(v.empty ? -1 : v.index));
  assert.equal(seen.at(-1), 0, '구독 즉시 현재 장면');
  player.step(1);
  assert.equal(seen.at(-1), 1, '이동하면 다시 받는다');
  off();
  player.step(1);
  assert.equal(seen.at(-1), 1, '구독을 끊으면 더 받지 않는다');
});

test('실을 게 없으면 빈 장면을 낸다', () => {
  const { player } = freshPlayer();
  assert.equal(player.view().empty, true);
  player.loadWith('bfs', null);
  assert.equal(player.view().empty, true);
  assert.equal(player.hasTrace(), false);
});
