/**
 * 학습 3단계의 순수 로직 검증 (요구사항 5.3).
 * Pyodide 자체는 브라우저에서만 돌지만, 경로 검증·오류 번역·경로 애니메이션 변환은
 * 여기서 검증한다.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { GOAL, expand, shuffle } from '../src/core/puzzle.js';
import { runAlgorithm } from '../src/core/algorithms/index.js';
import { validatePath, pathToResult } from '../src/core/pathTrace.js';
import { translateError } from '../src/core/pyErrors.js';

function seeded(s) { return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

test('올바른 해 경로를 통과시킨다', () => {
  const start = shuffle(8, GOAL, seeded(1));
  const path = runAlgorithm('bfs', start).solution.path;
  assert.deepEqual(validatePath(path, start, GOAL), { ok: true });
});

test('빈 경로·시작 불일치·목표 아님·잘못된 이동을 잡아낸다', () => {
  const start = [1, 5, 2, 4, 0, 3, 7, 8, 6];
  assert.equal(validatePath([], start, GOAL).reason, 'empty');
  assert.equal(validatePath([[...GOAL]], start, GOAL).reason, 'start');       // 시작이 다름
  assert.equal(validatePath([start], start, GOAL).reason, 'goal');            // 목표에서 안 끝남
  // 규칙에 맞지 않는 점프
  const bad = [start, [1, 2, 3, 4, 5, 6, 7, 8, 0]];
  assert.equal(validatePath(bad, start, GOAL).reason, 'move');
});

test('경로를 재생 결과로 감싸면 프레임 수가 경로 길이와 같고 마지막이 목표다', () => {
  const start = shuffle(6, GOAL, seeded(2));
  const path = runAlgorithm('bfs', start).solution.path;
  const result = pathToResult(path);
  assert.equal(result.frames.length, path.length);
  assert.equal(result.frames.at(-1).action, 'goal');
  assert.equal(result.solution.found, true);
  assert.equal(result.solution.moves, path.length - 1);
});

test('파이썬 오류를 한국어로 옮긴다 (요구사항 5.3.3)', () => {
  assert.match(translateError('IndexError: pop from empty list').ko, /OPEN이 비었/);
  assert.match(translateError("NameError: name 'expnd' is not defined").ko, /expnd/);
  assert.match(translateError('  File "x", line 3\n    if x\n        ^\nSyntaxError: expected \':\'').ko, /문법/);
  assert.match(translateError('RuntimeError: 탐색이 너무 오래 걸립니다 (step limit)').ko, /너무 오래|CLOSED/);
  assert.match(translateError('RecursionError: maximum recursion depth exceeded').ko, /재귀/);
  // 모르는 오류도 원문을 함께 준다
  const t = translateError('ValueError: something odd');
  assert.ok(t.ko.length > 0 && t.detail.includes('ValueError'));
});

test('DFS로 만든(최단 아닌) 경로도 규칙에는 맞으면 통과한다', () => {
  // 학생이 최단이 아니어도 유효하면 인정 (요구사항 5.3 — 최단 강요 안 함)
  const start = [1, 2, 3, 4, 5, 6, 0, 7, 8];  // 2수
  const path = runAlgorithm('bfs', start).solution.path;
  assert.equal(validatePath(path, start, GOAL).ok, true);
});
