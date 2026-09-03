/**
 * 동작 카드 — 지금 컴퓨터가 무엇을 하는지 큰 아이콘과 쉬운 한 문장으로 알려 준다.
 * 의사코드를 아직 모르는 학생도 무슨 일이 일어나는지 알 수 있게 하는 것이 목적이다.
 * 레슨 페이지 어디에서나 보이도록 코드 패널 밖(레슨 막대 아래)에 따로 둔다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';

const ACTION_VIS = {
  init:      { icon: '🚩', word: '시작',     plain: '첫 모양을 대기 목록에 넣어요.' },
  pop:       { icon: '👆', word: '꺼내기',   plain: '대기 목록에서 모양 하나를 꺼내 살펴봐요.' },
  goal:      { icon: '🎉', word: '찾았다!',  plain: '목표에 도착! 여기까지 온 길이 정답이에요.' },
  make:      { icon: '🌱', word: '펼치기',   plain: '지금 모양에서 갈 수 있는 다음 모양들을 만들어요.' },
  push:      { icon: '📥', word: '넣기',     plain: '새 모양을 대기 목록에 넣어 나중에 살펴봐요.' },
  skip:      { icon: '🚪', word: '건너뛰기', plain: '이미 본 모양이라서 넣지 않아요.' },
  exhausted: { icon: '🔚', word: '끝',       plain: '더 볼 게 없어요. 이 방법으론 못 찾았어요.' },
  limit:     { icon: '✋', word: '멈춤',     plain: '너무 많이 살펴봐서 여기서 멈춰요.' },
  restart:   { icon: '🔁', word: '다시',     plain: '더 깊이 볼 수 있게 처음부터 다시 시작해요.' },
  path:      { icon: '🚶', word: '따라가기', plain: '찾은 정답 길을 따라가요.' },
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
          el('div.action-card__plain', {}, '아래 ⏭ 한 단계를 누르면 무슨 일이 생기는지 여기에 알려 줄게요.'))));
      return;
    }
    const vis = ACTION_VIS[v.action] ?? { icon: '•', word: '진행 중', plain: v.narration };
    fill(root, el('div.action-card', { 'data-action': v.action },
      el('div.action-card__icon', { 'aria-hidden': 'true' }, vis.icon),
      el('div.action-card__body', {},
        el('div.action-card__word', {}, vis.word),
        el('div.action-card__plain', {}, vis.plain),
        el('div.action-card__detail', {}, v.narration))));
  }
  player.subscribe(draw);
  store.subscribe(draw);
}
