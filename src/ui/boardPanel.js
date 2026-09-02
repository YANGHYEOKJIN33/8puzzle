/**
 * 퍼즐 판 패널 (요구사항 4.1 ①).
 * 초기 상태 고르기는 언제나 보인다. 판 그림은 탐색 전에는 초기 상태를,
 * 탐색 중에는 "지금 검사 중인 노드"의 배치를 따라 그리며 움직인 타일을 강조한다.
 */
import { el, fill } from './dom.js';
import { GOAL, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';

/** 큰 3×3 판 하나를 그린다. moved 자리의 타일을 강조한다. */
export function renderBoard(state, moved = -1) {
  const board = el('div.board', { role: 'img', 'aria-label': describe(state) });
  state.forEach((tile, i) => {
    board.append(
      el(`div.tile${tile === 0 ? '.tile--blank' : ''}${i === moved ? '.tile--moved' : ''}`,
        { 'aria-hidden': 'true' }, tile === 0 ? '' : String(tile)),
    );
  });
  return board;
}

function describe(state) {
  const rows = [];
  for (let r = 0; r < 3; r += 1) rows.push(state.slice(r * 3, r * 3 + 3).map((t) => (t === 0 ? '빈칸' : t)).join(' '));
  return `퍼즐 배치: ${rows.join(' / ')}`;
}

/** 부모와 견주어 이번에 움직인 칸을 찾는다 */
function movedCell(node) {
  if (!node || node.parent === null || !node.parentState) return -1;
  for (let i = 0; i < node.state.length; i += 1) {
    if (node.state[i] !== node.parentState[i] && node.state[i] !== 0) return i;
  }
  return -1;
}

export function mountBoardPanel(root, store, player) {
  const body = el('div.panel__body');
  const hint = el('span.panel__hint', {}, '초기 상태');

  const presetSelect = el('select', {
    id: 'preset-select',
    onchange: (e) => store.set({ presetId: e.target.value }),
  }, PRESETS.map((p) => el('option', { value: p.id }, `${p.name} · ${p.note}`)));

  fill(root,
    el('div.panel__head', {}, el('span.panel__title', {}, '퍼즐 판'), hint),
    body,
  );

  function draw(v) {
    const preset = findById(PRESETS, store.get().presetId);
    presetSelect.value = preset.id;

    // 탐색을 아직 시작 안 했거나(비었거나) init 프레임(현재 노드 없음)이면 초기 상태를 보여 준다
    const node = v && !v.empty ? v.node : null;
    const showState = node ? node.state : preset.state;
    const started = Boolean(v && !v.empty);
    hint.textContent = started && node ? '지금 검사 중인 배치' : '초기 상태';

    const caption = node
      ? el('div.board-caption', {},
          el('strong', {}, `깊이 ${node.depth}`),
          node.moveLabel ? ` · 직전 이동 ${node.moveLabel}` : '')
      : el('div.board-caption', {}, el('strong', {}, '초기 상태'), ` · ${preset.name} (${preset.note})`);

    const onPath = node && started && v.pathIds.has(node.id) && v.finished;

    fill(body,
      el('div.board-row', {},
        renderBoard(showState, movedCell(node)),
        el('div.board-row__info', {},
          caption,
          onPath ? el('div.result.result--found', {}, '이 배치는 해 경로 위에 있습니다.') : null,
          el('div.field', {}, el('label', { for: 'preset-select' }, '초기 상태'), presetSelect),
          started ? progress(v) : el('p.panel__hint', {}, '▶ 재생 또는 ⏭ 한 단계로 탐색을 시작하세요.'),
        ),
      ),
      el('details.advanced', {},
        el('summary', {}, '설정 더보기 — 목표 상태'),
        el('div.board-row', { style: 'padding-top:8px' },
          renderBoard(GOAL),
          el('div.board-row__info', {},
            el('div.board-caption', {}, el('strong', {}, '목표 상태'), ' · 기본값'),
            el('p.panel__hint', {}, '초기 상태 직접 입력과 목표 상태 바꾸기는 다음 개발 단계에서 열립니다.'),
          ),
        ),
      ),
    );
  }

  function progress(v) {
    const pct = v.total <= 1 ? 100 : (v.index / (v.total - 1)) * 100;
    return el('div.progress', {},
      el('span', {}, `${v.index + 1}/${v.total}`),
      el('div.progress__bar', {}, el('div.progress__fill', { style: `width:${pct}%` })),
    );
  }

  player.subscribe(draw);
  store.subscribe(() => draw(player.view()));
}
