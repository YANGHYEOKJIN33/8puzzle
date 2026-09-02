/** 작은 3×3 미리보기 판 — OPEN 항목과 탐색 트리에서 쓴다 (요구사항 4.2.4) */
import { el } from './dom.js';
import { SIZE } from '../core/puzzle.js';

/**
 * @param {number[]} state 길이 9의 상태
 * @param {object}   [opt]
 * @param {number}   [opt.moved]  강조할 칸(직전에 움직인 타일) 번호
 * @param {string}   [opt.tone]   'current' | 'open' | 'closed' | 'path' | null
 */
export function miniBoard(state, opt = {}) {
  const { moved = -1, tone = null } = opt;
  const board = el(`div.mini${tone ? `.mini--${tone}` : ''}`, {
    role: 'img', 'aria-label': ariaFor(state),
  });
  state.forEach((tile, i) => {
    board.append(
      el(`span.mini__cell${tile === 0 ? '.mini__cell--blank' : ''}${i === moved ? '.mini__cell--moved' : ''}`,
        { 'aria-hidden': 'true' },
        tile === 0 ? '' : String(tile)),
    );
  });
  return board;
}

function ariaFor(state) {
  const rows = [];
  for (let r = 0; r < SIZE; r += 1) {
    rows.push(state.slice(r * SIZE, r * SIZE + SIZE).map((t) => (t === 0 ? '빈' : t)).join(''));
  }
  return `배치 ${rows.join('/')}`;
}
