/**
 * 동작 카드 — 지금 컴퓨터가 무엇을 하는지 큰 아이콘과 쉬운 한 문장으로 알려 준다.
 * 의사코드를 아직 모르는 학생도 무슨 일이 일어나는지 알 수 있게 하는 것이 목적이다.
 * 레슨 페이지 어디에서나 보이도록 코드 패널 밖(레슨 막대 아래)에 따로 둔다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';

/**
 * 지금 하는 일 = 정확한 용어(word) + 영어 용어(term) + 쉬운 한 문장(plain).
 * 교과서 용어를 그대로 쓰되, 바로 옆에 쉬운 말을 붙여 뜻이 막히지 않게 한다.
 */
const ACTION_VIS = {
  init:      { icon: '🚩', word: '초기화',   term: 'initialize', plain: '시작 노드를 OPEN 리스트에 넣어요.' },
  pop:       { icon: '👆', word: '꺼내기',   term: 'pop',        plain: 'OPEN에서 노드 하나를 꺼내 살펴봐요.' },
  goal:      { icon: '🎉', word: '목표 도달', term: 'goal test',  plain: '목표 상태예요! 여기까지 온 길이 해(정답)입니다.' },
  make:      { icon: '🌱', word: '확장',     term: 'expand',     plain: '지금 노드에서 갈 수 있는 자식 노드들을 만들어요.' },
  push:      { icon: '📥', word: '삽입',     term: 'push',       plain: '새 노드를 OPEN에 넣어 나중에 살펴봐요.' },
  skip:      { icon: '🚪', word: '중복 제거', term: 'duplicate',  plain: '이미 본 노드(CLOSED)라서 넣지 않아요.' },
  exhausted: { icon: '🔚', word: '탐색 실패', term: 'failure',    plain: 'OPEN이 비었어요. 이 방법으론 해를 못 찾았어요.' },
  limit:     { icon: '✋', word: '탐색 중단', term: 'cutoff',     plain: '정해 둔 한계만큼 살펴봐서 여기서 멈춰요.' },
  restart:   { icon: '🔁', word: '깊이 증가', term: 'deepening',  plain: '깊이 한계를 1 늘려 처음부터 다시 탐색해요.' },
  path:      { icon: '🚶', word: '해 경로',  term: 'solution path', plain: '찾은 해 경로를 따라가요.' },
};

export function mountActionCard(root, store, player) {
  function draw() {
    const v = player.view();
    const algo = findById(ALGORITHMS, store.get().algorithmId);
    if (v.empty) {
      fill(root, el('div.action-card.action-card--intro', {},
        el('div.action-card__icon', { 'aria-hidden': 'true' }, '🔎'),
        el('div.action-card__body', {},
          el('div.action-card__word', {}, algo.name),
          el('div.action-card__plain', {}, '위쪽 ⏭ 한 단계를 누르면 무슨 일이 생기는지 여기에 알려 줄게요.'))));
      return;
    }
    const vis = ACTION_VIS[v.action] ?? { icon: '•', word: '진행 중', term: '', plain: v.narration };
    fill(root, el('div.action-card', { 'data-action': v.action },
      el('div.action-card__icon', { 'aria-hidden': 'true' }, vis.icon),
      el('div.action-card__body', {},
        el('div.action-card__word', {}, vis.word,
          vis.term ? el('span.action-card__term', {}, vis.term) : null),
        el('div.action-card__plain', {}, vis.plain),
        el('div.action-card__detail', {}, v.narration))));
  }
  player.subscribe(draw);
  store.subscribe(draw);
}
