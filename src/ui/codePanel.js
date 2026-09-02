/**
 * 코드 패널 (요구사항 3.3 · 4.1 ②).
 * 순서도 / 의사코드 / 파이썬을 탭으로 전환한다 (요구사항 3.3.4).
 * 실제 내용과 실행 줄 강조는 6단계(의사코드 모드)에서 채운다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';

const VIEWS = [
  { id: 'flow',   name: '순서도',   hint: '전체 흐름을 도형으로' },
  { id: 'pseudo', name: '의사코드', hint: '교과서 표기에 가깝게' },
  { id: 'python', name: '파이썬',   hint: '의사코드와 줄이 대응된다' },
];

export function mountCodePanel(root, store) {
  const tabs = el('div', { role: 'tablist', style: 'display:flex;gap:8px' });
  const body = el('div.panel__body');

  const tabButtons = VIEWS.map((view) =>
    el('button.pill', {
      type: 'button',
      role: 'tab',
      'data-view': view.id,
      title: view.hint,
      onclick: () => store.set({ codeView: view.id }),
    }, view.name),
  );
  tabs.append(...tabButtons);

  fill(root,
    el('div.panel__head', {}, el('span.panel__title', {}, '코드'), tabs),
    body,
  );

  store.subscribe((state) => {
    for (const button of tabButtons) {
      button.setAttribute('aria-selected', String(button.dataset.view === state.codeView));
    }
    const algo = findById(ALGORITHMS, state.algorithmId);
    const view = VIEWS.find((v) => v.id === state.codeView) ?? VIEWS[1];

    fill(body,
      el('div.narration', {}, `${algo.name}(${algo.en}) — ${algo.point}`),
      el('div.placeholder', {},
        el('strong', {}, `${view.name} 준비 중`),
        `${algo.name}의 ${view.name}는 개발 6~7단계에서 채웁니다. `,
        '이 자리에 한 줄씩 실행되는 내용이 표시되고, 지금 실행 중인 줄이 강조됩니다.',
      ),
    );
  });
}
