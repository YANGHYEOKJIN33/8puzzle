/**
 * 화면에 내놓는 예제 초기 상태가 광고한 난이도와 실제로 맞는지 확인한다.
 * (요구사항 3.1.1 — 난이도별 예제 / 3.1.2 — 해가 없는 배치를 내놓지 않기)
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { GOAL, PRESETS, ALGORITHMS } from '../src/app/config.js';
import { isSolvable, isValidState } from '../src/core/puzzle.js';
import { optimalDepth } from './helpers/optimalDepth.js';

test('목표 상태 자체가 올바르다', () => {
  assert.equal(isValidState([...GOAL]), true);
});

for (const preset of PRESETS) {
  test(`예제 "${preset.name}"는 올바르고 풀 수 있다`, () => {
    assert.equal(isValidState(preset.state), true);
    assert.equal(isSolvable(preset.state), true);
  });

  test(`예제 "${preset.name}"의 최소 이동 횟수는 ${preset.minMoves}수다`, () => {
    assert.equal(optimalDepth(preset.state), preset.minMoves);
  });

  test(`예제 "${preset.name}"의 안내 문구가 실제 최소 이동 횟수로 시작한다`, () => {
    assert.ok(preset.note.startsWith(`${preset.minMoves}수`), `note="${preset.note}"`);
  });
}

test('예제는 쉬운 것부터 어려운 순서로 놓여 있다', () => {
  const moves = PRESETS.map((preset) => preset.minMoves);
  const sorted = [...moves].sort((a, b) => a - b);
  assert.deepEqual(moves, sorted);
});

test('모든 알고리즘이 교과서 성질(완전성·최적성·시간·공간)을 갖는다', () => {
  for (const algo of ALGORITHMS) {
    assert.ok(algo.props, `${algo.id}에 props가 없다`);
    for (const key of ['complete', 'optimal', 'time', 'space']) {
      assert.ok(algo.props[key] && algo.props[key].length > 0, `${algo.id}.props.${key}가 비었다`);
    }
  }
});
