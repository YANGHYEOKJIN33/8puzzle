/**
 * 상단 막대 — 2단계 내비게이션.
 *   1줄: 큰 탭 넷 [📦 자료구조] [🧩 탐색 기초] [🌿 알고리즘] [✅ 정리·확인]
 *   2줄: 알고리즘 하위 탭(🌿 알고리즘일 때만) [너비 BFS][깊이 DFS][최상우선][A*][언덕등반]
 * 알고리즘은 하위 탭으로 고른다(예전 "찾는 방법" 드롭다운 대체).
 */
import { el, fill } from './dom.js';
import { ALGO_TABS } from '../app/lesson.js';

/** 무엇을 배우는 중인가 — 큰 탭 넷 */
const MODES = [
  { id: 'ds',     label: '📦 자료구조',   tip: '큐·스택·우선순위 큐를 직접 넣고 꺼내 보며 배웁니다' },
  { id: 'basics', label: '🧩 탐색 기초',  tip: '8-퍼즐·상태·노드·확장·OPEN·CLOSED·순서도·휴리스틱' },
  { id: 'algo',   label: '🌿 알고리즘',   tip: '알고리즘마다 동작·의사코드·파이썬을 하나씩 깊게 배웁니다' },
  { id: 'wrap',   label: '✅ 정리·확인',  tip: '배운 것을 정리하고 문제로 이해를 확인합니다' },
];

export function mountTopbar(root, store, onCompare = () => {}, onHelp = () => {}, onGlossary = () => {}) {
  const modeButtons = MODES.map((mode) => el('button.pill.modetab', {
    type: 'button', role: 'tab', title: mode.tip,
    onclick: () => store.set({ mode: mode.id }),
  }, mode.label));

  // 알고리즘 하위 탭 (algo 모드에서만 보인다)
  const subButtons = ALGO_TABS.map((a) => el('button.pill.subtab', {
    type: 'button', role: 'tab', title: `${a.name} 배우기`,
    onclick: () => store.set({ mode: 'algo', algoTab: a.id }),
  }, a.name));
  const subtabs = el('div.subtabs', { role: 'tablist', 'aria-label': '알고리즘 고르기' },
    el('span.subtabs__label', {}, '알고리즘:'), ...subButtons);

  const compareBtn = el('button.pill', {
    type: 'button', title: '같은 문제를 여러 방법으로 풀어 결과를 나란히 비교',
    onclick: () => onCompare(),
  }, '⚖ 비교');
  const glossaryBtn = el('button.pill', {
    type: 'button', title: '화면에 나오는 용어의 뜻 찾아보기', onclick: () => onGlossary(),
  }, '📖 용어');
  const helpBtn = el('button.pill', {
    type: 'button', title: '사용 안내 다시 보기', onclick: () => onHelp(),
  }, '? 도움말');
  const themeBtn = el('button.pill', {
    type: 'button', title: '밝은 화면 / 어두운 화면 바꾸기',
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

  fill(root,
    el('div.topbar__row', {},
      el('h1.topbar__title', {},
        '8-퍼즐로 배우는 탐색 알고리즘',
        el('small', {}, '자료구조 → 순서도 → 의사코드 → 파이썬'),
      ),
      el('div.modetabs', { role: 'tablist', 'aria-label': '무엇을 배울까요' }, modeButtons),
      el('span.topbar__spacer'),
      el('div.topbar__tools', {}, helpBtn, glossaryBtn, compareBtn, smaller, bigger, themeBtn),
    ),
    subtabs,
  );

  store.subscribe((state) => {
    modeButtons.forEach((b, i) => b.setAttribute('aria-selected', String(MODES[i].id === state.mode)));
    const isAlgo = state.mode === 'algo';
    subtabs.hidden = !isAlgo;
    subButtons.forEach((b, i) => b.setAttribute('aria-selected', String(isAlgo && ALGO_TABS[i].id === state.algoTab)));
    // 자료구조 탭에서는 비교가 쓰이지 않는다 — 화면을 단순하게 둔다
    compareBtn.hidden = state.mode === 'ds';
    themeBtn.textContent =
      state.theme === 'auto' ? '🌗 자동'
      : state.theme === 'light' ? '☀ 밝게'
      : '🌙 어둡게';
  });
}
