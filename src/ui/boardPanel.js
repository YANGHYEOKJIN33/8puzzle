/**
 * 퍼즐 판 패널 (요구사항 4.1 ①).
 * "지금 검사 중인 노드"의 배치를 움직이는 판으로 보여 준다. 타일이 미끄러지며 옮겨져
 * 어떤 이동이 일어났는지 눈으로 따라갈 수 있다. 초기 상태 고르기는 언제나 보인다.
 */
import { el, fill } from './dom.js';
import { GOAL, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';
import { createAnimatedBoard } from './animatedBoard.js';

/** 작은 정적 판 하나(목표 상태 미리보기용) */
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
  const hint = el('span.panel__hint', {}, '초기 상태');
  const anim = createAnimatedBoard();

  const presetSelect = el('select', {
    id: 'preset-select',
    onchange: (e) => store.set({ presetId: e.target.value }),
  }, PRESETS.map((p) => el('option', { value: p.id }, `${p.name} · ${p.note}`)));

  // 캡션·결과·진행 막대는 자주 바뀌므로 참조를 잡아 두고 내용만 갱신한다
  const caption = el('div.board-caption');
  const banner = el('div');           // 해 경로 배너 자리
  const foot = el('div');             // 진행 막대 또는 안내
  const goalDetails = el('details.advanced', {},
    el('summary', {}, '설정 더보기 — 목표 상태'),
    el('div.board-row', { style: 'padding-top:8px' },
      renderBoard(GOAL),
      el('div.board-row__info', {},
        el('div.board-caption', {}, el('strong', {}, '목표 상태'), ' · 기본값'),
        el('p.panel__hint', {}, '초기 상태 직접 입력과 목표 상태 바꾸기는 다음 개발 단계에서 열립니다.'),
      ),
    ),
  );

  const body = el('div.panel__body', {},
    el('div.board-row', {},
      anim.el,
      el('div.board-row__info', {}, caption, banner,
        el('div.field', {}, el('label', { for: 'preset-select' }, '초기 상태'), presetSelect),
        foot),
    ),
    goalDetails,
  );

  fill(root, el('div.panel__head', {}, el('span.panel__title', {}, '퍼즐 판'), hint), body);

  let lastPresetId = null;

  function draw(v) {
    const preset = findById(PRESETS, store.get().presetId);
    presetSelect.value = preset.id;

    const node = v && !v.empty ? v.node : null;
    const started = Boolean(v && !v.empty);
    const showState = node ? node.state : preset.state;

    // 프리셋이 바뀌었거나 아직 시작 전이면 전환 없이 새 판을 세팅
    if (!started) {
      if (lastPresetId !== preset.id) { anim.reset(preset.state); lastPresetId = preset.id; }
      else anim.update(preset.state, { movedValue: 0 });
    } else {
      anim.update(showState, { movedValue: movedValueOf(node) });
      lastPresetId = preset.id;
    }

    hint.textContent = started && node ? '지금 검사 중인 배치' : '초기 상태';
    fill(caption, node
      ? [el('strong', {}, `깊이 ${node.depth}`), node.moveLabel ? ` · 직전 이동 ${node.moveLabel}` : '']
      : [el('strong', {}, '초기 상태'), ` · ${preset.name} (${preset.note})`]);

    const onPath = node && started && v.pathIds.has(node.id) && v.finished;
    fill(banner, onPath ? el('div.result.result--found', {}, '이 배치는 해 경로 위에 있습니다.') : null);

    fill(foot, started ? progress(v) : el('p.panel__hint', {}, '▶ 재생 또는 ⏭ 한 단계로 탐색을 시작하세요.'));
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
