/**
 * 퍼즐 판 패널 (요구사항 4.1 ①).
 * 왼쪽에 "지금 검사 중(또는 초기) 배치"(움직이는 판), 오른쪽에 "목표" 배치를 나란히
 * 보여 준다. 학생이 "지금 여기 → 목표 저기"를 한눈에 견줄 수 있다.
 */
import { el, fill } from './dom.js';
import { GOAL, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';
import { createAnimatedBoard } from './animatedBoard.js';
import { lessonAt } from '../app/lesson.js';
import { expand, isGoal } from '../core/puzzle.js';
import { findExercise } from '../app/exercises.js';
import { miniBoard } from './miniBoard.js';

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

  // 직접 밀어 보는 모드(1쪽) — 학생이 손으로 연산자를 써 보게 한다.
  // 여기서만 쓰는 값이라 store에 두지 않는다.
  let hand = null;          // { state, moves }
  const anim = createAnimatedBoard({ onTile: (value) => slideTile(value) });

  function handMode() { return Boolean(lessonAt(store.get().lessonStep).show.play); }

  function resetHand(state) { hand = { state: state.slice(), moves: 0 }; }

  function slideTile(value) {
    if (!handMode() || !hand) return;
    const move = expand(hand.state).find((m) => m.tile === value);
    if (!move) return;                       // 빈칸 옆이 아니면 못 민다
    hand = { state: move.state, moves: hand.moves + 1 };
    draw(player.view());
  }

  const presetSelect = el('select', {
    id: 'preset-select',
    onchange: (e) => store.set({ presetId: e.target.value }),
  }, PRESETS.map((p) => el('option', { value: p.id }, `${p.name} · ${p.note}`)));

  const nowLabel = el('div.board-cap');   // "지금 배치 / 초기 상태" 라벨
  const banner = el('div');               // 해 경로 배너 · 직접 밀기 안내
  const foot = el('div');                 // 진행 막대 또는 안내
  const extra = el('div');                // 자식 노드 미리보기(2쪽)

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
    extra,
  );

  fill(root, el('div.panel__head', {}, el('span.panel__title', {}, '퍼즐 판'), hint), body);

  let lastPresetId = null;

  function draw(v) {
    const state = store.get();
    const preset = findById(PRESETS, state.presetId);
    presetSelect.value = preset.id;

    // --- 직접 밀어 보는 모드 (1쪽) ---
    if (handMode()) {
      if (!hand || lastPresetId !== preset.id) { resetHand(preset.state); lastPresetId = preset.id; anim.reset(hand.state); }
      else anim.update(hand.state, { movedValue: 0 });
      anim.setMovable(expand(hand.state).map((m) => m.tile));
      drawHand();
      return;
    }
    anim.setMovable([]);
    fill(extra, null);

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
    const showControls = Boolean(lessonAt(state.lessonStep).show.controls);
    fill(foot, !showControls ? null
      : started ? progress(v)
      : el('p.panel__hint', {}, '위쪽 ⏭ 한 단계를 눌러 보세요.'));

    // 판 아래 보조 그림 — 쪽마다 다르다
    const show = lessonAt(state.lessonStep).show;
    fill(extra,
      show.children ? childrenStrip(showState)          // 2쪽: 확장이 무슨 뜻인지
      : show.codemap ? codeMap(state.exerciseId)        // 6쪽: 코드가 퍼즐의 어디인지
      : null);
  }

  /** 코드 한 줄 ↔ 8-퍼즐에서 하는 일 (빈칸 채우기 쪽) */
  function codeMap(exerciseId) {
    const exercise = findExercise(exerciseId);
    if (!exercise.map) return null;
    return el('div.fillmap', {},
      el('div.fillmap__cap', {}, '🔎 이 코드가 8-퍼즐에서 하는 일'),
      el('dl.fillmap__list', {}, exercise.map.flatMap(([code, means]) => [
        el('dt.fillmap__code', {}, code),
        el('dd.fillmap__means', {}, means),
      ])),
    );
  }

  /** 직접 밀어 보는 모드의 라벨·안내·되돌리기 */
  function drawHand() {
    const done = isGoal(hand.state);
    fill(nowLabel, el('strong', {}, '내가 미는 판'), ` · ${hand.moves}번 움직임`);
    fill(banner, done
      ? el('div.result.result--found', {}, '🎉 목표 상태를 만들었어요! 컴퓨터는 이 길을 스스로 찾아냅니다.')
      : el('p.panel__hint', {}, '파란 테두리 타일을 눌러 빈칸 쪽으로 밀어 보세요. 이렇게 상태를 바꾸는 규칙을 ',
          el('strong', {}, '연산자(operator)'), '라고 해요.'));
    fill(foot, el('button.pill', { type: 'button', onclick: () => { resetHand(findById(PRESETS, store.get().presetId).state); anim.reset(hand.state); draw(player.view()); } }, '↺ 처음 상태로'));
    fill(extra, childrenStrip(hand.state, { title: '지금 판에서 갈 수 있는 다음 상태' }));
  }

  /** 지금 상태에서 만들 수 있는 자식 상태들 */
  function childrenStrip(state, { title = '지금 노드를 확장하면 만들어지는 자식 노드' } = {}) {
    const children = expand(state);
    return el('div.kids', {},
      el('div.kids__cap', {}, title,
        el('span.kids__term', {}, `expand · ${children.length}개`)),
      el('div.kids__list', {}, children.map((child) => el('div.kids__item', {},
        miniBoard(child.state, { moved: child.to }),
        el('span.kids__label', {}, child.label)))),
    );
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
