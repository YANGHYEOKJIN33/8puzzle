/**
 * 자료구조 규칙 시험 — 큐 · 스택 · 우선순위 큐.
 * 화면과 상관없이 "무엇을 먼저 꺼내는가"가 규칙대로인지만 확인한다.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DS_KINDS, dsKind, push, pop, insertIndex, nextOutIndex, outOrder } from '../src/core/structures.js';

const item = (label, priority = 0) => ({ id: label, label, priority });
const labels = (list) => list.map((it) => it.label).join('');

function fillBox(kindId, specs) {
  let box = [];
  for (const spec of specs) box = push(kindId, box, spec).items;
  return box;
}

test('큐는 먼저 넣은 것이 먼저 나온다 (FIFO)', () => {
  const box = fillBox('queue', [item('A'), item('B'), item('C')]);
  assert.equal(labels(box), 'ABC');
  assert.equal(labels(outOrder('queue', [item('A'), item('B'), item('C')])), 'ABC');
});

test('스택은 마지막에 넣은 것이 먼저 나온다 (LIFO)', () => {
  assert.equal(labels(outOrder('stack', [item('A'), item('B'), item('C')])), 'CBA');
});

test('우선순위 큐는 번호가 작은 것부터 나온다', () => {
  const specs = [item('A', 5), item('B', 1), item('C', 3)];
  assert.equal(labels(outOrder('priority', specs)), 'BCA');
});

test('우선순위가 같으면 먼저 온 것이 먼저 나온다 (안정 정렬)', () => {
  const specs = [item('A', 2), item('B', 2), item('C', 1)];
  assert.equal(labels(outOrder('priority', specs)), 'CAB');
});

test('넣은 자리를 알려 준다 — 화면 애니메이션이 이 값을 쓴다', () => {
  assert.equal(insertIndex('queue', [item('A'), item('B')], item('C')), 2);
  assert.equal(insertIndex('stack', [item('A'), item('B')], item('C')), 2);
  // 급한(1) 것이 덜 급한(5) 것 앞에 끼어든다
  assert.equal(insertIndex('priority', [item('A', 5)], item('B', 1)), 0);
  // 같은 급한 정도면 뒤에 선다
  assert.equal(insertIndex('priority', [item('A', 2)], item('B', 2)), 1);
});

test('다음에 나갈 자리는 큐·우선순위 큐는 맨 앞, 스택은 맨 뒤', () => {
  const three = [item('A'), item('B'), item('C')];
  assert.equal(nextOutIndex('queue', three), 0);
  assert.equal(nextOutIndex('priority', three), 0);
  assert.equal(nextOutIndex('stack', three), 2);
  assert.equal(nextOutIndex('queue', []), -1);
});

test('빈 상자에서 꺼내면 아무것도 나오지 않는다', () => {
  const result = pop('queue', []);
  assert.equal(result.item, null);
  assert.deepEqual(result.items, []);
});

test('넣기·꺼내기는 원래 배열을 고치지 않는다', () => {
  const before = [item('A')];
  push('queue', before, item('B'));
  pop('queue', before);
  assert.equal(labels(before), 'A');
});

test('자료구조 셋 모두 이름·규칙·이어지는 알고리즘을 갖고 있다', () => {
  assert.equal(DS_KINDS.length, 3);
  for (const kind of DS_KINDS) {
    for (const key of ['name', 'sub', 'rule', 'story', 'inWord', 'outWord', 'becomes', 'algo']) {
      assert.ok(kind[key] && kind[key].length > 0, `${kind.id}에 ${key}가 없다`);
    }
  }
  assert.equal(dsKind('없는id').id, 'queue');   // 모르는 id는 첫 번째로
});
