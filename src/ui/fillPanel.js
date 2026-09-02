/**
 * 학습 2단계(빈칸 채우기) 화면 (요구사항 5.2).
 * 코드 패널의 본문에 그려진다. 문제를 고르고, 빈칸을 드롭다운으로 채우고,
 * 실행하면 그 선택이 만든 알고리즘으로 탐색을 돌려 옆 패널에 시각화한다.
 */
import { el, fill } from './dom.js';
import { EXERCISES, findExercise } from '../app/exercises.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';

/**
 * @param {HTMLElement} body   코드 패널의 본문
 * @param {object} store
 * @param {object} player
 * @param {object} local       이 패널이 기억할 값 { exerciseId, choices, feedback }
 */
export function renderFill(body, store, player, local) {
  const exercise = findExercise(local.exerciseId);

  // 문제 선택 탭
  const picker = el('div.fill-picker', { role: 'tablist' },
    EXERCISES.map((ex) =>
      el('button.pill', {
        type: 'button', role: 'tab',
        'aria-selected': String(ex.id === exercise.id),
        onclick: () => { local.exerciseId = ex.id; local.choices = {}; local.feedback = null; local.render(); },
      }, ex.title.split(' — ')[0]),
    ),
  );

  // 코드 + 빈칸(드롭다운)
  const codeLines = exercise.lines.map((line) => {
    const parts = Array.isArray(line) ? line : [line];
    return el('div.fill-line', {},
      parts.map((part) => {
        if (typeof part === 'string') return document.createTextNode(part);
        const blank = exercise.blanks[part.blank];
        const chosen = local.choices[part.blank] ?? '';
        const sel = el('select.fill-blank', {
          'aria-label': blank.label,
          onchange: (e) => { local.choices[part.blank] = e.target.value; local.feedback = null; local.render(); },
        },
          el('option', { value: '', disabled: true, selected: chosen === '' }, `— ${blank.label} —`),
          blank.options.map((o) => el('option', { value: o.value, selected: chosen === o.value }, o.text)),
        );
        return sel;
      }),
    );
  });

  // 실행 버튼: 모든 빈칸이 채워졌을 때만
  const allFilled = Object.keys(exercise.blanks).every((b) => local.choices[b]);
  const runBtn = el('button.ctrl.ctrl--primary', {
    type: 'button', disabled: !allFilled,
    onclick: () => runExercise(exercise, store, player, local),
  }, '이 코드로 실행 ▶');

  const feedbackEl = local.feedback ? feedbackBox(local.feedback) : null;
  fill(body,
    el('p.fill-intro', {}, exercise.intro),
    picker,
    el('pre.codeview.fill-code', {}, codeLines),
    el('div.fill-actions', {}, runBtn, el('span.panel__hint', {}, exercise.hint)),
    feedbackEl,
  );

  // 실행을 막 눌렀다면 결과가 바로 보이도록 스크롤한다
  if (local.justRan && feedbackEl) {
    feedbackEl.scrollIntoView({ block: 'nearest' });
    local.justRan = false;
  }
}

function runExercise(exercise, store, player, local) {
  // 고른 선택들을 모아 실행 설정(run)을 합친다
  let run = {};
  const notes = [];
  for (const [blankId, blank] of Object.entries(exercise.blanks)) {
    const option = blank.options.find((o) => o.value === local.choices[blankId]);
    if (!option) return;
    run = { ...run, ...option.run };
    notes.push(option.note);
  }

  // store를 바꾸면 main.js가 그 알고리즘·휴리스틱으로 다시 싣는다
  store.set(run);
  const result = player.load();

  const algo = findById(ALGORITHMS, run.algorithmId);
  local.feedback = { algoName: algo.name, notes, result, run };
  local.justRan = true;
  local.render();
}

function feedbackBox(fb) {
  const { result } = fb;
  const found = result && result.solution.found;
  const detail = !result ? ''
    : found
      ? `해를 ${result.solution.moves}수에 찾았습니다. 펼친 노드 ${result.stats.expanded}개, OPEN 최대 ${result.stats.maxOpen}개.`
      : (result.solution.reason === 'local-optimum'
          ? '지역 최적에 막혀 멈췄습니다(언덕 등반의 한계).'
          : result.solution.reason === 'depth-limit'
            ? '깊이 한계 안에서는 찾지 못했습니다.'
            : '정해진 상한 안에서는 찾지 못했습니다.');

  return el(`div.fill-feedback${found ? '.fill-feedback--ok' : '.fill-feedback--info'}`, {},
    el('div.fill-feedback__head', {}, `채운 코드는 「${fb.algoName}」처럼 동작합니다.`),
    el('div.fill-feedback__note', {}, fb.notes.join(' ')),
    el('div.fill-feedback__detail', {}, detail,
      ' 오른쪽에서 ▶ 재생으로 과정을 살펴보세요.'),
  );
}
