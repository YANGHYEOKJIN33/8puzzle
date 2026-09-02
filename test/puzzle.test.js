/** 8-퍼즐 규칙 검증 (요구사항 7.5.2) */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BLANK, GOAL, MOVES, SIZE,
  blankIndex, expand, format, fromKey, indexOf, inversions,
  isGoal, isSolvable, isValidState, key, rowCol, shuffle,
} from '../src/core/puzzle.js';

test('목표 상태는 목표로 인정된다', () => {
  assert.equal(isGoal([...GOAL]), true);
  assert.equal(isGoal([1, 2, 3, 4, 5, 6, 7, 0, 8]), false);
});

test('key와 fromKey는 서로를 되돌린다', () => {
  const state = [8, 6, 7, 2, 5, 4, 3, 0, 1];
  assert.equal(key(state), '867254301');
  assert.deepEqual(fromKey(key(state)), state);
});

test('칸 번호와 행·열이 서로 맞는다', () => {
  assert.deepEqual(rowCol(0), { row: 0, col: 0 });
  assert.deepEqual(rowCol(4), { row: 1, col: 1 });
  assert.deepEqual(rowCol(8), { row: 2, col: 2 });
  assert.equal(indexOf(1, 1), 4);
  assert.equal(indexOf(-1, 0), -1, '판 밖은 -1');
  assert.equal(indexOf(0, SIZE), -1, '판 밖은 -1');
});

test('빈칸의 위치를 찾는다', () => {
  assert.equal(blankIndex([...GOAL]), 8);
  assert.equal(blankIndex([0, 1, 2, 3, 4, 5, 6, 7, 8]), 0);
});

test('빈칸이 모서리면 2가지, 변이면 3가지, 가운데면 4가지로 움직인다', () => {
  assert.equal(expand([0, 1, 2, 3, 4, 5, 6, 7, 8]).length, 2, '왼쪽 위 모서리');
  assert.equal(expand([1, 0, 2, 3, 4, 5, 6, 7, 8]).length, 3, '위쪽 변');
  assert.equal(expand([1, 2, 3, 4, 0, 5, 6, 7, 8]).length, 4, '가운데');
  assert.equal(expand([...GOAL]).length, 2, '오른쪽 아래 모서리');
});

test('한 번 미는 것은 빈칸과 이웃 타일을 맞바꾸는 것이다', () => {
  const state = [1, 2, 3, 4, 0, 6, 7, 5, 8];
  const down = expand(state).find((move) => move.dir === 'down');

  assert.deepEqual(down.state, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
  assert.equal(down.tile, 5, '실제로 밀린 타일');
  assert.equal(down.from, 7, '타일이 있던 자리');
  assert.equal(down.to, 4, '타일이 도착한 자리(원래 빈칸)');
  assert.equal(down.state.filter((t) => t === BLANK).length, 1, '빈칸은 언제나 하나');
});

test('expand는 원래 상태를 건드리지 않는다 (되감기의 전제)', () => {
  const state = [1, 2, 3, 4, 0, 6, 7, 5, 8];
  const copy = state.slice();
  const moves = expand(state);
  assert.deepEqual(state, copy, '원본이 그대로다');
  assert.notEqual(moves[0].state, state, '새 배열을 돌려준다');
});

test('만들어진 다음 상태는 모두 올바른 상태다', () => {
  for (const move of expand([8, 6, 7, 2, 5, 4, 3, 0, 1])) {
    assert.equal(isValidState(move.state), true);
  }
});

test('이동 순서는 항상 위·아래·왼쪽·오른쪽 차례다', () => {
  const dirs = expand([1, 2, 3, 4, 0, 6, 7, 5, 8]).map((move) => move.dir);
  assert.deepEqual(dirs, MOVES.map((m) => m.dir));
});

test('올바르지 않은 상태를 걸러낸다', () => {
  assert.equal(isValidState([...GOAL]), true);
  assert.equal(isValidState([1, 2, 3]), false, '칸 수가 모자람');
  assert.equal(isValidState([1, 1, 2, 3, 4, 5, 6, 7, 0]), false, '숫자가 겹침');
  assert.equal(isValidState([1, 2, 3, 4, 5, 6, 7, 8, 9]), false, '범위 밖 숫자');
  assert.equal(isValidState('123456780'), false, '배열이 아님');
});

test('역위 수를 센다', () => {
  assert.equal(inversions([...GOAL]), 0);
  assert.equal(inversions([2, 1, 3, 4, 5, 6, 7, 8, 0]), 1);
  assert.equal(inversions([1, 2, 3, 4, 5, 6, 8, 7, 0]), 1);
});

test('해가 없는 배치를 가려낸다 (요구사항 3.1.2)', () => {
  assert.equal(isSolvable([...GOAL]), true);
  assert.equal(isSolvable([1, 2, 3, 4, 5, 6, 8, 7, 0]), false, '두 타일만 뒤바뀐 배치');
  assert.equal(isSolvable([8, 6, 7, 2, 5, 4, 3, 0, 1]), true, '가장 어려운 배치도 풀린다');
});

test('한 번 미는 것으로는 풀 수 있는지 여부가 바뀌지 않는다', () => {
  const state = [8, 6, 7, 2, 5, 4, 3, 0, 1];
  for (const move of expand(state)) {
    assert.equal(isSolvable(move.state), true);
  }
});

test('목표에서 섞어 만든 상태는 반드시 풀 수 있다', () => {
  let seed = 12345;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 50; i += 1) {
    const state = shuffle(30, GOAL, random);
    assert.equal(isValidState(state), true);
    assert.equal(isSolvable(state), true);
  }
});

test('글자 그림으로 보여 준다', () => {
  assert.equal(format([1, 2, 3, 4, 0, 6, 7, 5, 8]), '1 2 3\n4 _ 6\n7 5 8');
});
