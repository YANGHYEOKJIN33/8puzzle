/**
 * 학습 2단계(빈칸 채우기) 화면 (요구사항 5.2).
 * 코드 패널의 본문에 그려진다. 문제를 고르고, 빈칸을 드롭다운으로 채우고,
 * 실행하면 그 선택이 만든 알고리즘으로 탐색을 돌려 옆 패널에 시각화한다.
 */
import { el, fill } from './dom.js';
import { EXERCISES, findExercise } from '../app/exercises.js';
import { ALGORITHMS, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';
import { expand } from '../core/puzzle.js';
import { h0, h1, h2 } from '../core/heuristics.js';
import { miniBoard } from './miniBoard.js';

/**
 * @param {HTMLElement} body   코드 패널의 본문
 * @param {object} store
 * @param {object} player
 * @param {object} local       이 패널이 기억할 값 { choices, feedback } (고른 문제는 store에 있다)
 */
export function renderFill(body, store, player, local) {
  const exercise = findExercise(store.get().exerciseId);

  // 문제 선택 탭
  const picker = el('div.fill-picker', { role: 'tablist' },
    EXERCISES.map((ex) =>
      el('button.pill', {
        type: 'button', role: 'tab',
        'aria-selected': String(ex.id === exercise.id),
        onclick: () => { local.choices = {}; local.feedback = null; store.set({ exerciseId: ex.id }); local.render(); },
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
  const startState = findById(PRESETS, store.get().presetId).state;
  fill(body,
    el('p.fill-intro', {}, exercise.intro),
    picker,
    el('pre.codeview.fill-code', {}, codeLines),
    el('div.fill-actions', {}, runBtn, el('span.panel__hint', {}, exercise.hint)),
    // 고른 값이 실제 퍼즐 배치에 무슨 일을 하는지 — 코드 바로 아래에 붙여 둔다
    previewBox(exercise, local, startState),
    feedbackEl,
  );

  // 실행을 막 눌렀다면 결과가 바로 보이도록 스크롤한다
  if (local.justRan && feedbackEl) {
    feedbackEl.scrollIntoView({ block: 'nearest' });
    local.justRan = false;
  }
}

/* ---------------- 이 코드가 8-퍼즐에서 무슨 일인지 (요청 ③) ---------------- */

/** 초기 배치에서 한 수씩 밀어 만든 실제 배치들 — 예시에 진짜 퍼즐을 쓴다 */
function sampleStates(startState, count) {
  const list = [];
  let state = startState;
  for (let i = 0; i < count; i += 1) {
    const kids = expand(state);
    if (kids.length === 0) break;
    list.push({ state: kids[0].state, g: i + 1, moved: kids[0].to });
    state = kids[0].state;
  }
  return list;
}

/** 형제 배치들 — 한 번 확장하면 OPEN에 이렇게 들어간다 */
function siblingStates(startState, count) {
  return expand(startState).slice(0, count).map((k, i) => ({ state: k.state, g: 1, moved: k.to, label: k.label, order: i + 1 }));
}

/** 후보 배치 한 칸 (미니 판 + 꼬리표들) */
function candidate(item, tags, { picked = false } = {}) {
  return el(`div.fillprev__item${picked ? '.fillprev__item--picked' : ''}`, {},
    miniBoard(item.state, { moved: item.moved }),
    el('div.fillprev__tags', {}, tags.map((t) => el('span.fillprev__tag', {}, t))),
  );
}

/** 고른 값이 실제 퍼즐 배치에 무슨 일을 하는지 그림으로 */
function previewBox(exercise, local, startState) {
  if (!exercise.preview) return null;

  if (exercise.preview === 'pop') {
    const items = siblingStates(startState, 3);
    if (items.length < 2) return null;
    const chosen = local.choices.pos;
    const takeFirst = chosen === '0';
    const takeLast = chosen === '-1';
    return el('div.fillprev', {},
      el('div.fillprev__cap', {}, '🧩 지금 OPEN에 이 배치들이 있다면 — ',
        el('code', {}, 'OPEN.pop(자리)'), '는 어느 것을 꺼낼까요?'),
      el('div.fillprev__row', {}, items.map((it, i) =>
        candidate(it, [`${i + 1}번째로 들어옴`, it.label],
          { picked: (takeFirst && i === 0) || (takeLast && i === items.length - 1) }))),
      el('div.fillprev__marks', {},
        el('span.fillprev__mark', {}, '⬆ 왼쪽 = ', el('code', {}, 'pop(0)'), ' 이 꺼내는 것'),
        el('span.topbar__spacer'),
        el('span.fillprev__mark', {}, el('code', {}, 'pop(-1)'), ' 이 꺼내는 것 = 오른쪽 ⬆')),
    );
  }

  if (exercise.preview === 'sort') {
    const items = sampleStates(startState, 3);
    if (items.length < 2) return null;
    const withVals = items.map((it) => ({ ...it, h: h2(it.state), f: it.g + h2(it.state) }));
    const minH = Math.min(...withVals.map((i) => i.h));
    const minF = Math.min(...withVals.map((i) => i.f));
    const key = local.choices.key;
    return el('div.fillprev', {},
      el('div.fillprev__cap', {}, '🧩 OPEN에 이 배치들이 있다면 — 정렬 기준에 따라 맨 앞이 달라져요'),
      el('div.fillprev__row', {}, withVals.map((it) =>
        candidate(it, [`g=${it.g}`, `h=${it.h}`, `g+h=${it.f}`],
          { picked: (key === 'n.h' && it.h === minH) || (key === 'n.g + n.h' && it.f === minF) }))),
      el('div.fillprev__marks', {},
        el('span.fillprev__mark', {}, el('code', {}, 'n.h'), ` 로 정렬하면 h=${minH} 인 배치가 먼저`),
        el('span.topbar__spacer'),
        el('span.fillprev__mark', {}, el('code', {}, 'n.g + n.h'), ` 로 정렬하면 g+h=${minF} 인 배치가 먼저`)),
    );
  }

  // 'h' — 같은 배치에 어림 방법마다 값이 얼마나 되는지
  const chosen = local.choices.h;
  const rows = [
    { value: '0', name: 'return 0', v: h0(startState), why: '아무 정보도 안 씀' },
    { value: 'misplaced', name: '제자리 아닌 타일 수', v: h1(startState), why: '자리가 틀린 타일 개수' },
    { value: 'manhattan', name: '맨해튼 거리 합', v: h2(startState), why: '타일마다 제자리까지의 칸 수를 모두 더함' },
  ];
  return el('div.fillprev', {},
    el('div.fillprev__cap', {}, '🧩 이 배치에 ', el('code', {}, 'h(state)'), ' 를 넣으면 이런 값이 나와요'),
    el('div.fillprev__hrow', {},
      el('div.fillprev__item', {}, miniBoard(startState, {}),
        el('div.fillprev__tags', {}, el('span.fillprev__tag', {}, '지금 초기 배치'))),
      el('div.fillprev__hlist', {}, rows.map((r) =>
        el(`div.fillprev__hitem${chosen === r.value ? '.fillprev__hitem--picked' : ''}`, {},
          el('strong', {}, `h = ${r.v}`),
          el('span', {}, ` · ${r.name}`),
          el('span.fillprev__why', {}, r.why)))),
    ),
  );
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
      ? `해를 ${result.solution.moves}수에 찾았습니다. 확장한 노드 ${result.stats.expanded}개, OPEN 최대 ${result.stats.maxOpen}개.`
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
