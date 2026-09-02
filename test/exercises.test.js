/**
 * 학습 2단계 빈칸 문제 데이터 검증 (요구사항 5.2).
 * 각 선택지가 실제로 존재하는 알고리즘·휴리스틱으로 이어지는지, 빈칸 참조가 맞는지 본다.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { EXERCISES, findExercise } from '../src/app/exercises.js';
import { READY_IDS } from '../src/core/algorithms/index.js';
import { HEURISTICS } from '../src/app/config.js';

const HEURISTIC_IDS = new Set(HEURISTICS.map((h) => h.id));

test('문제가 하나 이상 있고 id가 겹치지 않는다', () => {
  assert.ok(EXERCISES.length >= 2);
  const ids = EXERCISES.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const exercise of EXERCISES) {
  test(`「${exercise.title}」의 코드 속 빈칸이 blanks에 정의되어 있다`, () => {
    const referenced = new Set();
    for (const line of exercise.lines) {
      const parts = Array.isArray(line) ? line : [line];
      for (const part of parts) {
        if (part && typeof part === 'object' && part.blank) {
          referenced.add(part.blank);
          assert.ok(exercise.blanks[part.blank], `빈칸 ${part.blank}이 정의됨`);
        }
      }
    }
    // 정의된 빈칸은 모두 코드에서 실제로 쓰인다
    for (const id of Object.keys(exercise.blanks)) {
      assert.ok(referenced.has(id), `빈칸 ${id}이 코드에 나타난다`);
    }
  });

  test(`「${exercise.title}」의 모든 선택지가 실제 알고리즘·휴리스틱을 가리킨다`, () => {
    for (const blank of Object.values(exercise.blanks)) {
      assert.ok(blank.options.length >= 2, '선택지는 둘 이상');
      const values = blank.options.map((o) => o.value);
      assert.equal(new Set(values).size, values.length, '선택지 값이 겹치지 않는다');
      for (const option of blank.options) {
        assert.ok(READY_IDS.includes(option.run.algorithmId), `${option.run.algorithmId}는 준비된 알고리즘`);
        if (option.run.heuristicId) {
          assert.ok(HEURISTIC_IDS.has(option.run.heuristicId), `${option.run.heuristicId}는 실제 휴리스틱`);
        }
        assert.ok(option.note && option.note.length > 0, '선택지에 설명이 있다');
      }
    }
  });
}

test('findExercise는 없는 id에 첫 문제를 돌려준다', () => {
  assert.equal(findExercise('없는id').id, EXERCISES[0].id);
  assert.equal(findExercise(EXERCISES[1].id).id, EXERCISES[1].id);
});
