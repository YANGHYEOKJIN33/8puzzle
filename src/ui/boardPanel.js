/**
 * 퍼즐 판 패널 (요구사항 4.1 ①).
 * 왼쪽에 "지금 검사 중(또는 초기) 배치"(움직이는 판), 오른쪽에 "목표" 배치를 나란히
 * 보여 준다. 학생이 "지금 여기 → 목표 저기"를 한눈에 견줄 수 있다.
 */
import { el, fill } from './dom.js';
import { GOAL, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';
import { createAnimatedBoard } from './animatedBoard.js';

/** 작은 정적 판 하나 (목표 미리보기용) */
export function renderBoard(state, moved = -1) {
  const board = el('div.board', { role: 'img', 'aria-label': describe(state) });
  state.forEach((tile, i) => {
    board.append(el(`div.tile${tile === 0 ? '.tile--blank' : ''}${i === moved ? '.tile--moved' : ''}`,
      { 'aria-hidden': 'true' }, tile === 0 ? '' : String(tile)));
  });
  return board;
}

function describe(state) {
  const rows = [];
  for (let r = 0; r < 3; r += 1) rows.push(state.slice(r * 3, r * 3 + 3).map((t) => (t === 0 ? '빈칸' : t)).join(' '));
  return `퍼즐 배치: ${rows.join(' / ')}`;
}

/** 노드가 부모에서 올 때 밀린 타일 숫자(강조용). 뿌리/미상이면 0. */
function movedValueOf(node) {
  if (!node || node.parent === null || !node.parentState) return 0;
  for (let i = 0; i < node.state.length; i += 1) {
    if (node.state[i] !== node.parentState[i] && node.state[i] !== 0) return node.state[i];
  }
  return 0;
}

export function mountBoardPanel(root, store, player) {
  const hint = el('span.panel__hint', {}, '초기 상태 → 목표');
  const anim = createAnimatedBoard();

  const presetSelect = el('select', {
    id: 'preset-select',
    onchange: (e) => store.set({ presetId: e.target.value }),
  }, PRESETS.map((p) => el('option', { value: p.id }, `${p.name} · ${p.note}`)));

  const nowLabel = el('div.board-cap');   // "지금 배치 / 초기 상태" 라벨
  const banner = el('div');               // 해 경로 배너
  const foot = el('div');                 // 진행 막대 또는 안내

  // 목표 판(정적) — 언제나 오른쪽에 보인다
  const goalCell = el('div.board-cell', {},
    renderBoardMini(GOAL),
    el('div.board-cap', {}, el('strong', {}, '목표')));

  const body = el('div.panel__body', {},
    el('div.board-duo', {},
      el('div.board-cell', {}, anim.el, nowLabel),
      el('div.board-arrow', { 'aria-hidden': 'true' }, '→'),
      goalCell,
      el('div.board-side', {}, banner,
        el('div.field', {}, el('label', { for: 'preset-select' }, '초기 상태'), presetSelect),
        foot),
    ),
  );

  fill(root, el('div.panel__head', {}, el('span.panel__title', {}, '퍼즐 판'), hint), body);

  let lastPresetId = null;

  function draw(v) {
    const preset = findById(PRESETS, store.get().presetId);
    presetSelect.value = preset.id;

    const node = v && !v.empty ? v.node : null;
    const started = Boolean(v && !v.empty);
    const showState = node ? node.state : preset.state;

    if (!started) {
      if (lastPresetId !== preset.id) { anim.reset(preset.state); lastPresetId = preset.id; }
      else anim.update(preset.state, { movedValue: 0 });
    } else {
      anim.update(showState, { movedValue: movedValueOf(node) });
      lastPresetId = preset.id;
    }

    fill(nowLabel, node
      ? [el('strong', {}, '지금 배치'), ` · 깊이 ${node.depth}`]
      : [el('strong', {}, '초기 상태'), ` · ${preset.name}`]);

    const onPath = node && started && v.pathIds.has(node.id) && v.finished;
    fill(banner, onPath ? el('div.result.result--found', {}, '이 배치는 해 경로 위에 있습니다.') : null);
    fill(foot, started ? progress(v) : el('p.panel__hint', {}, '▶ 재생 또는 ⏭ 한 단계로 시작하세요.'));
  }

  function progress(v) {
    const pct = v.total <= 1 ? 100 : (v.index / (v.total - 1)) * 100;
    return el('div.progress', {},
      el('span', {}, `${v.index + 1}/${v.total}`),
      el('div.progress__bar', {}, el('div.progress__fill', { style: `width:${pct}%` })));
  }

  player.subscribe(draw);
  store.subscribe(() => draw(player.view()));
}

/** 목표 판처럼 작게 그리는 정적 판 */
function renderBoardMini(state) {
  const board = el('div.board.board--mini', { role: 'img', 'aria-label': describe(state) });
  state.forEach((tile) => {
    board.append(el(`div.tile${tile === 0 ? '.tile--blank' : ''}`, { 'aria-hidden': 'true' }, tile === 0 ? '' : String(tile)));
  });
  return board;
}
