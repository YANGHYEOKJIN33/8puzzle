/**
 * 퍼즐 판 패널 (요구사항 4.1 ①).
 * 2단계에서는 "고른 초기 상태"와 "목표 상태"를 보여 주는 데까지 만든다.
 * 탐색 중 현재 노드를 따라 그리는 일은 4~5단계에서 붙인다.
 */
import { el, fill } from './dom.js';
import { GOAL, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';

/** 3x3 판 하나를 그린다. moved 자리의 타일은 강조한다. */
export function renderBoard(state, moved = -1) {
  const board = el('div.board', { role: 'img', 'aria-label': describe(state) });
  state.forEach((tile, i) => {
    board.append(
      el(`div.tile${tile === 0 ? '.tile--blank' : ''}${i === moved ? '.tile--moved' : ''}`,
        { 'aria-hidden': 'true' },
        tile === 0 ? '' : String(tile)),
    );
  });
  return board;
}

function describe(state) {
  const rows = [];
  for (let r = 0; r < 3; r += 1) {
    rows.push(state.slice(r * 3, r * 3 + 3).map((t) => (t === 0 ? '빈칸' : t)).join(' '));
  }
  return `퍼즐 배치: ${rows.join(' / ')}`;
}

export function mountBoardPanel(root, store) {
  const body = el('div.panel__body');

  const presetSelect = el('select', {
    id: 'preset-select',
    onchange: (e) => store.set({ presetId: e.target.value }),
  }, PRESETS.map((p) => el('option', { value: p.id }, `${p.name} · ${p.note}`)));

  fill(root,
    el('div.panel__head', {},
      el('span.panel__title', {}, '퍼즐 판'),
      el('span.panel__hint', {}, '지금 검사 중인 배치'),
    ),
    body,
  );

  store.subscribe((state) => {
    const preset = findById(PRESETS, state.presetId);
    presetSelect.value = preset.id;

    fill(body,
      el('div.board-row', {},
        renderBoard(preset.state),
        el('div.board-row__info', {},
          el('div.board-caption', {}, el('strong', {}, '초기 상태'), ` · ${preset.name} (${preset.note})`),
          el('div.field', {},
            el('label', { for: 'preset-select' }, '바꾸기'),
            presetSelect,
          ),
        ),
      ),
      el('details.advanced', {},
        el('summary', {}, '설정 더보기 — 목표 상태'),
        el('div.board-row', { style: 'padding-top:8px' },
          renderBoard(GOAL),
          el('div.board-row__info', {},
            el('div.board-caption', {}, el('strong', {}, '목표 상태'), ' · 기본값'),
            el('p.panel__hint', {},
              '초기 상태 직접 입력과 목표 상태 바꾸기는 다음 개발 단계에서 열립니다.'),
          ),
        ),
      ),
    );
  });
}
