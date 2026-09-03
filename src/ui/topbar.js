/**
 * 상단 막대 — 알고리즘 선택 + 보기 설정.
 * 요구사항 6.1.1 : 첫 화면에서 학생이 내리는 결정은 "알고리즘"과 "학습 단계" 둘뿐이다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';

/** 무엇을 배우는 중인가 — 큰 탭 두 개 (요청: 자료구조도 따로 배울 수 있게) */
const MODES = [
  { id: 'search', label: '🧩 8-퍼즐 탐색', tip: '탐색 알고리즘을 순서도·코드로 배웁니다' },
  { id: 'ds',     label: '📦 자료구조',    tip: '큐·스택·우선순위 큐를 직접 넣고 꺼내 보며 배웁니다' },
];

export function mountTopbar(root, store, onCompare = () => {}, onHelp = () => {}, onGlossary = () => {}) {
  const modeButtons = MODES.map((mode) => el('button.pill.modetab', {
    type: 'button', role: 'tab', title: mode.tip,
    onclick: () => store.set({ mode: mode.id }),
  }, mode.label));

  const algoField = el('span.topbar__field');

  const select = el('select', {
    id: 'algo-select',
    onchange: (e) => store.set({ algorithmId: e.target.value }),
  });

  // 맹목적 / 경험적으로 묶어 보여 준다 (요구사항 3.2)
  for (const [family, label] of [['blind', '맹목적 탐색'], ['heuristic', '경험적 탐색']]) {
    const group = el('optgroup', { label });
    for (const algo of ALGORITHMS.filter((a) => a.family === family)) {
      group.append(el('option', { value: algo.id }, algo.name));
    }
    select.append(group);
  }

  const compareBtn = el('button.pill', {
    type: 'button', title: '같은 문제를 여러 방법으로 풀어 결과를 나란히 비교',
    onclick: () => onCompare(),
  }, '⚖ 비교');

  const glossaryBtn = el('button.pill', {
    type: 'button', title: '화면에 나오는 용어의 뜻 찾아보기',
    onclick: () => onGlossary(),
  }, '📖 용어');

  const helpBtn = el('button.pill', {
    type: 'button', title: '사용 안내 다시 보기',
    onclick: () => onHelp(),
  }, '? 도움말');

  const themeBtn = el('button.pill', {
    type: 'button',
    title: '밝은 화면 / 어두운 화면 바꾸기',
    onclick: () => {
      const order = ['auto', 'light', 'dark'];
      const next = order[(order.indexOf(store.get().theme) + 1) % order.length];
      store.set({ theme: next });
    },
  });

  const smaller = el('button.pill', {
    type: 'button', title: '글자 작게',
    onclick: () => store.set({ scale: Math.max(0.85, +(store.get().scale - 0.15).toFixed(2)) }),
  }, '가−');

  const bigger = el('button.pill', {
    type: 'button', title: '글자 크게 (교실 뒷자리 가독성)',
    onclick: () => store.set({ scale: Math.min(1.6, +(store.get().scale + 0.15).toFixed(2)) }),
  }, '가＋');

  fill(algoField,
    el('label', { for: 'algo-select', class: 'panel__title' }, '찾는 방법'),
    select,
  );

  fill(root,
    el('h1.topbar__title', {},
      '8-퍼즐로 배우는 탐색 알고리즘',
      el('small', {}, '자료구조 → 순서도 → 의사코드 → 파이썬'),
    ),
    el('div.modetabs', { role: 'tablist', 'aria-label': '무엇을 배울까요' }, modeButtons),
    algoField,
    el('span.topbar__spacer'),
    el('div.topbar__tools', {}, helpBtn, glossaryBtn, compareBtn, smaller, bigger, themeBtn),
  );

  store.subscribe((state) => {
    select.value = state.algorithmId;
    modeButtons.forEach((b, i) => b.setAttribute('aria-selected', String(MODES[i].id === state.mode)));
    // 자료구조 탭에서는 알고리즘·비교가 쓰이지 않는다 — 화면을 단순하게 둔다
    const search = state.mode !== 'ds';
    algoField.hidden = !search;
    compareBtn.hidden = !search;
    themeBtn.textContent =
      state.theme === 'auto' ? '🌗 자동'
      : state.theme === 'light' ? '☀ 밝게'
      : '🌙 어둡게';
  });
}
