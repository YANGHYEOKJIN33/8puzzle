/**
 * 코드 패널 (요구사항 3.3 · 4.1 ②).
 * 순서도 / 의사코드 / 파이썬 탭을 전환하고, 실행 중인 줄을 강조한다 (요구사항 3.3.2·3.3.3).
 * 5단계에서는 의사코드에 실제 내용을 채우고 현재 줄을 강조한다.
 * (순서도·파이썬은 6~7단계에서 같은 줄 번호로 채운다.)
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';
import { getAlgorithm } from '../core/algorithms/index.js';

const VIEWS = [
  { id: 'flow',   name: '순서도',   hint: '전체 흐름을 도형으로' },
  { id: 'pseudo', name: '의사코드', hint: '교과서 표기에 가깝게' },
  { id: 'python', name: '파이썬',   hint: '의사코드와 줄이 대응된다' },
];

export function mountCodePanel(root, store, player) {
  const tabs = el('div', { role: 'tablist', style: 'display:flex;gap:8px' });
  const body = el('div.panel__body');

  const tabButtons = VIEWS.map((v) =>
    el('button.pill', {
      type: 'button', role: 'tab', 'data-view': v.id, title: v.hint,
      onclick: () => store.set({ codeView: v.id }),
    }, v.name),
  );
  tabs.append(...tabButtons);

  fill(root,
    el('div.panel__head', {}, el('span.panel__title', {}, '코드'), tabs),
    body,
  );

  let activeLine = 0;   // 재생기가 알려 주는, 지금 강조할 줄

  function draw() {
    const state = store.get();
    for (const b of tabButtons) b.setAttribute('aria-selected', String(b.dataset.view === state.codeView));

    const algo = findById(ALGORITHMS, state.algorithmId);
    const module = getAlgorithm(algo.id);
    const viewId = state.codeView;

    // 의사코드가 준비된 경우: 실제 줄을 그리고 현재 줄을 강조
    if (viewId === 'pseudo' && module && module.pseudo) {
      fill(body,
        narration(),
        el('pre.codeview', {},
          module.pseudo.map((text, i) =>
            el(`div.codeline${i + 1 === activeLine ? '.codeline--active' : ''}`, {},
              el('span.codeline__no', {}, String(i + 1)),
              el('span', {}, text),
            ),
          ),
        ),
      );
      return;
    }

    // 순서도·파이썬은 아직 준비 중
    const v = VIEWS.find((x) => x.id === viewId) ?? VIEWS[1];
    fill(body,
      narration(),
      el('div.placeholder', {},
        el('strong', {}, `${v.name} 준비 중`),
        `${algo.name}의 ${v.name}는 개발 ${viewId === 'python' ? '9' : '6'}단계에서 채웁니다. ` +
        '의사코드 탭에서는 지금도 실행 줄이 강조됩니다.'),
    );
  }

  function narration() {
    const v = player.view();
    const algo = findById(ALGORITHMS, store.get().algorithmId);
    const text = v.empty ? `${algo.name}(${algo.en}) — ${algo.point}` : v.narration;
    return el('div.narration', {}, text);
  }

  store.subscribe(draw);
  player.subscribe((v) => {
    activeLine = v.empty ? 0 : v.line;
    draw();
  });
}
