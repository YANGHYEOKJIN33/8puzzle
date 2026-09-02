/**
 * 움직이는 퍼즐 판 (학습자 이해 최우선).
 *
 * 타일을 절대 위치에 두고 transform으로 자리를 옮기면, CSS 전환으로 "타일이
 * 빈칸으로 미끄러져 들어가는" 모습이 자연스럽게 나온다. 매 프레임 판을 새로 그리는
 * 대신 이 판을 한 번 만들고 update(state)로 자리만 옮겨, 어떤 타일이 어디로
 * 움직였는지 눈으로 따라갈 수 있게 한다.
 */
import { el } from './dom.js';
import { SIZE } from '../core/puzzle.js';

export function createAnimatedBoard() {
  const board = el('div.board.board--anim', { role: 'img', 'aria-label': '퍼즐 판' });
  const tiles = new Map();   // 숫자 → 타일 요소

  for (let v = 1; v < SIZE * SIZE; v += 1) {
    const tile = el('div.atile', { 'data-v': v, 'aria-hidden': 'true' },
      el('div.atile__face', {}, String(v)));
    tiles.set(v, tile);
    board.append(tile);
  }

  /**
   * 상태에 맞게 타일 자리를 옮긴다.
   * @param movedValue 이번에 (부모에서) 밀린 타일 숫자 — 그 타일만 강조한다(0/미지정이면 강조 없음)
   */
  function update(state, { movedValue = 0 } = {}) {
    board.setAttribute('aria-label', describe(state));
    for (let v = 1; v < SIZE * SIZE; v += 1) {
      const idx = state.indexOf(v);
      const row = Math.floor(idx / SIZE);
      const col = idx % SIZE;
      const tile = tiles.get(v);
      tile.style.transform = `translate(${col * 100}%, ${row * 100}%)`;
      tile.classList.toggle('atile--moved', v === movedValue);
    }
  }

  /** 강조 없이 처음 상태를 세팅(전환 애니메이션 없이 바로 자리 잡기) */
  function reset(state) {
    board.classList.add('board--noanim');
    update(state, { movedValue: 0 });
    // 다음 프레임부터 전환이 살아나도록 잠깐 뒤 클래스 제거
    requestAnimationFrame(() => requestAnimationFrame(() => board.classList.remove('board--noanim')));
  }

  return { el: board, update, reset };
}

function describe(state) {
  const rows = [];
  for (let r = 0; r < SIZE; r += 1) {
    rows.push(state.slice(r * SIZE, r * SIZE + SIZE).map((t) => (t === 0 ? '빈칸' : t)).join(' '));
  }
  return `퍼즐 배치: ${rows.join(' / ')}`;
}
