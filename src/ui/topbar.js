/**
 * 상단 막대 — 알고리즘 선택 + 보기 설정.
 * 요구사항 6.1.1 : 첫 화면에서 학생이 내리는 결정은 "알고리즘"과 "학습 단계" 둘뿐이다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';

export function mountTopbar(root, store, onCompare = () => {}, onHelp = () => {}) {
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

  fill(root,
    el('h1.topbar__title', {},
      '8-퍼즐로 배우는 탐색 알고리즘',
      el('small', {}, '순서도 → 의사코드 → 파이썬'),
    ),
    el('label', { for: 'algo-select', class: 'panel__title' }, '찾는 방법'),
    select,
    el('span.topbar__spacer'),
    el('div.topbar__tools', {}, helpBtn, compareBtn, smaller, bigger, themeBtn),
  );

  store.subscribe((state) => {
    select.value = state.algorithmId;
    themeBtn.textContent =
      state.theme === 'auto' ? '화면 · 자동'
      : state.theme === 'light' ? '화면 · 밝게'
      : '화면 · 어둡게';
  });
}
