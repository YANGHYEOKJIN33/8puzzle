/**
 * 용어 사전 시험 — 화면에서 쓰는 용어가 사전에 빠짐없이 있는지 확인한다.
 * (용어를 화면에서 바꾸면 사전도 함께 손보게 하려는 안전망)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GLOSSARY, glossaryEntries, searchGlossary } from '../src/app/glossary.js';
import { ALGORITHMS } from '../src/app/config.js';
import { DS_KINDS } from '../src/core/structures.js';

test('모든 항목이 용어·영어·설명·위치를 갖는다', () => {
  for (const group of GLOSSARY) {
    assert.ok(group.group.length > 0);
    assert.ok(group.items.length > 0, `${group.group}이 비었다`);
    for (const item of group.items) {
      for (const key of ['term', 'en', 'plain', 'where']) {
        assert.ok(item[key] && item[key].length > 0, `${item.term}에 ${key}가 없다`);
      }
    }
  }
});

test('용어가 중복되지 않는다', () => {
  const terms = glossaryEntries().map((e) => e.term);
  assert.equal(new Set(terms).size, terms.length);
});

test('화면에 나오는 알고리즘 이름이 모두 사전에 있다', () => {
  const terms = new Set(glossaryEntries().map((e) => e.term));
  for (const algo of ALGORITHMS) {
    assert.ok(terms.has(algo.name), `사전에 "${algo.name}"이 없다`);
  }
});

test('자료구조 세 가지가 모두 사전에 있다', () => {
  const terms = new Set(glossaryEntries().map((e) => e.term));
  for (const kind of DS_KINDS) {
    assert.ok(terms.has(kind.name), `사전에 "${kind.name}"이 없다`);
  }
});

test('화면의 핵심 용어가 사전에 있다', () => {
  const terms = new Set(glossaryEntries().map((e) => e.term));
  for (const must of ['노드', '상태', '확장', 'OPEN 리스트', 'CLOSED', '탐색 트리',
                      '휴리스틱', '순서도', '의사코드', 'g(n)', 'h(n)', 'f(n)']) {
    assert.ok(terms.has(must), `사전에 "${must}"이 없다`);
  }
});

test('찾기는 용어·영어·설명 어디에 있어도 걸린다', () => {
  const byTerm = searchGlossary('스택');
  assert.ok(byTerm.some((g) => g.items.some((i) => i.term === '스택')));

  const byEn = searchGlossary('LIFO');
  assert.ok(byEn.length > 0);

  const byPlain = searchGlossary('매표소');
  assert.ok(byPlain.some((g) => g.items.some((i) => i.term === '큐')));

  assert.deepEqual(searchGlossary('없는낱말xyz'), []);
  assert.equal(searchGlossary('  ').length, GLOSSARY.length);   // 빈 검색은 전체
});
