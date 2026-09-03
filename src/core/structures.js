/**
 * 자료구조 규칙만 담은 순수 로직 — 큐 · 스택 · 우선순위 큐.
 *
 * 왜 따로 두나요?
 *   학생들은 스택·큐를 배운 적이 없습니다. 8-퍼즐 탐색을 배우기 전에
 *   "무엇을 먼저 꺼내는가" 규칙 하나만 먼저 익히면, 탐색 알고리즘이
 *   "자료구조를 바꾼 것뿐"이라는 것을 알 수 있습니다.
 *
 * 화면 코드가 없으므로 노드에서 그대로 시험할 수 있습니다(test/structures.test.js).
 * 모든 함수는 넣은 배열을 고치지 않고 새 배열을 돌려줍니다.
 */

/** 학생이 배우는 자료구조 세 가지 (쉬운 말 · 실생활 비유) */
export const DS_KINDS = [
  {
    id: 'queue',
    name: '큐',
    en: 'Queue',
    sub: '줄 서기',
    icon: '🎟️',
    rule: '먼저 들어온 것이 먼저 나가요',
    ruleShort: '먼저 온 것이 먼저',
    ruleEn: 'FIFO — First In, First Out',
    story: '매표소 줄과 똑같아요. 먼저 줄을 선 사람이 먼저 표를 삽니다. ' +
           '새로 온 사람은 맨 뒤에 서고, 표는 맨 앞 사람부터 사요.',
    inWord: '줄 맨 뒤에 서요',
    outWord: '줄 맨 앞 사람이 나가요',
    becomes: '너비 우선 탐색(BFS)',
    becomesWhy: '가까운 곳부터 골고루 살펴봐서, 가장 짧은 길을 찾아 줘요.',
    algo: 'bfs',
  },
  {
    id: 'stack',
    name: '스택',
    en: 'Stack',
    sub: '접시 쌓기',
    icon: '🍽️',
    rule: '마지막에 들어온 것이 먼저 나가요',
    ruleShort: '마지막에 온 것이 먼저',
    ruleEn: 'LIFO — Last In, First Out',
    story: '접시를 차곡차곡 쌓아 둔 것과 똑같아요. 새 접시는 맨 위에 올리고, ' +
           '꺼낼 때도 맨 위 접시부터 꺼내요. 아래 접시는 한참 기다려야 해요.',
    inWord: '맨 위에 올려요',
    outWord: '맨 위 것을 꺼내요',
    becomes: '깊이 우선 탐색(DFS)',
    becomesWhy: '방금 만든 것을 바로 또 살펴봐서, 한 갈래를 끝까지 파고들어요.',
    algo: 'dfs',
  },
  {
    id: 'priority',
    name: '우선순위 큐',
    en: 'Priority Queue',
    sub: '응급실',
    icon: '🏥',
    rule: '급한 것이 먼저 나가요 (번호가 작을수록 급해요)',
    ruleShort: '급한 것이 먼저',
    ruleEn: 'Priority Queue — 값이 작은 것부터',
    story: '응급실과 똑같아요. 온 순서가 아니라 얼마나 급한지로 순서를 정해요. ' +
           '나중에 왔어도 더 급하면 앞으로 갑니다.',
    inWord: '급한 정도에 맞는 자리에 끼어들어요',
    outWord: '가장 급한 것이 나가요',
    becomes: '최상 우선 탐색 · A*',
    becomesWhy: '“목표에 가까워 보이는 것”을 먼저 살펴봐서 빨리 도착해요.',
    algo: 'best',
  },
];

export function dsKind(id) {
  return DS_KINDS.find((k) => k.id === id) ?? DS_KINDS[0];
}

/**
 * 새 항목이 들어갈 자리를 규칙대로 정한다.
 * 배열은 언제나 "왼쪽이 앞(먼저 나갈 쪽)"으로 둔다.
 *  - 큐   : 맨 뒤
 *  - 스택 : 맨 뒤 (화면에서는 이 끝을 '맨 위'로 그린다)
 *  - 우선순위 큐 : 나보다 급하지 않은 것 앞에 끼어든다(같으면 뒤 — 온 순서 유지)
 */
export function insertIndex(kindId, items, item) {
  if (kindId !== 'priority') return items.length;
  let i = 0;
  while (i < items.length && items[i].priority <= item.priority) i += 1;
  return i;
}

/** 다음에 나갈 항목의 자리. 비었으면 -1 */
export function nextOutIndex(kindId, items) {
  if (items.length === 0) return -1;
  return kindId === 'stack' ? items.length - 1 : 0;
}

/** 넣기 — { items, index } 를 돌려준다 (index = 들어간 자리) */
export function push(kindId, items, item) {
  const index = insertIndex(kindId, items, item);
  const next = items.slice();
  next.splice(index, 0, item);
  return { items: next, index };
}

/** 꺼내기 — { items, item, index } 를 돌려준다. 비었으면 item = null */
export function pop(kindId, items) {
  const index = nextOutIndex(kindId, items);
  if (index === -1) return { items: items.slice(), item: null, index: -1 };
  const next = items.slice();
  const [item] = next.splice(index, 1);
  return { items: next, item, index };
}

/**
 * 같은 것을 같은 순서로 넣었을 때, 자료구조마다 나오는 순서.
 * (‘셋을 견줘 봐요’ 쪽에서 쓴다)
 */
export function outOrder(kindId, items) {
  let box = [];
  for (const item of items) box = push(kindId, box, item).items;
  const out = [];
  while (box.length > 0) {
    const result = pop(kindId, box);
    out.push(result.item);
    box = result.items;
  }
  return out;
}
