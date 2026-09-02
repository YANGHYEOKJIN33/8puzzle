/** 휴리스틱 검증 (요구사항 3.2.2 · 7.5.2) */
import test from 'node:test';
import assert from 'node:assert/strict';

import { GOAL, expand, shuffle } from '../src/core/puzzle.js';
import { getHeuristic, h0, h1, h2 } from '../src/core/heuristics.js';
import { optimalDepth } from './helpers/optimalDepth.js';

test('목표 상태에서는 셋 다 0이다', () => {
  assert.equal(h0([...GOAL]), 0);
  assert.equal(h1([...GOAL]), 0);
  assert.equal(h2([...GOAL]), 0);
});

test('h0은 언제나 0이다', () => {
  assert.equal(h0([8, 6, 7, 2, 5, 4, 3, 0, 1]), 0);
});

test('h1은 제자리에 없는 타일을 센다 (빈칸은 세지 않는다)', () => {
  // 7과 8만 자리가 바뀐 배치
  assert.equal(h1([1, 2, 3, 4, 5, 6, 8, 7, 0]), 2);
  // 빈칸만 다른 자리에 있는 배치 — 타일은 모두 제자리이므로 0
  assert.equal(h1([1, 2, 3, 4, 5, 6, 7, 8, 0]), 0);
  assert.equal(h1([0, 1, 2, 3, 4, 5, 6, 7, 8]), 8, '모든 타일이 어긋난 배치');
});

test('h2는 각 타일이 제자리까지 가야 할 칸 수를 더한다', () => {
  // 8만 한 칸 어긋난 배치 → 8이 한 칸 움직이면 된다
  assert.equal(h2([1, 2, 3, 4, 5, 6, 7, 0, 8]), 1);
  // 7과 8이 서로 바뀐 배치 → 각각 한 칸씩
  assert.equal(h2([1, 2, 3, 4, 5, 6, 8, 7, 0]), 2);
  // 5는 아래로 한 칸, 8은 왼쪽으로 한 칸 어긋난 배치
  assert.equal(h2([1, 2, 3, 4, 0, 6, 7, 5, 8]), 2);
});

test('h2는 h1보다 작지 않다 — 더 많은 것을 알려 준다', () => {
  let seed = 987654321;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 100; i += 1) {
    const state = shuffle(25, GOAL, random);
    assert.ok(h2(state) >= h1(state), `h2 >= h1 이어야 한다: ${state}`);
  }
});

test('셋 다 실제 남은 거리를 넘겨 잡지 않는다 (허용적 · A*의 최적성 조건)', () => {
  let seed = 24680;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 30; i += 1) {
    const state = shuffle(12, GOAL, random);
    const truth = optimalDepth(state);
    assert.ok(h0(state) <= truth, 'h0');
    assert.ok(h1(state) <= truth, `h1(${h1(state)}) <= ${truth}`);
    assert.ok(h2(state) <= truth, `h2(${h2(state)}) <= ${truth}`);
  }
});

test('한 번 밀 때 h2는 많아야 1만큼 변한다 (일관성)', () => {
  const state = [8, 6, 7, 2, 5, 4, 3, 0, 1];
  const before = h2(state);
  for (const move of expand(state)) {
    assert.ok(Math.abs(h2(move.state) - before) <= 1);
  }
});

test('이름으로 휴리스틱을 찾는다', () => {
  assert.equal(getHeuristic('h0'), h0);
  assert.equal(getHeuristic('h1'), h1);
  assert.equal(getHeuristic('h2'), h2);
  assert.equal(getHeuristic('없는이름'), h2, '모르는 이름이면 h2를 쓴다');
});

test('목표를 바꾸면 그 목표를 기준으로 잰다', () => {
  const goal = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  assert.equal(h1([...goal], goal), 0);
  assert.equal(h2([...goal], goal), 0);
  assert.ok(h1([...GOAL], goal) > 0, '기본 목표는 이 목표와 다르다');
});
