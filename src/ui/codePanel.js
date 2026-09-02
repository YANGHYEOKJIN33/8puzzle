/**
 * 코드 패널 (요구사항 3.3 · 4.1 ②).
 * 순서도 / 의사코드 / 파이썬 탭을 전환하고, 실행 중인 위치를 강조한다.
 *   순서도   : 지금 실행 중인 도형 강조 (요구사항 3.3.1)
 *   의사코드 : 지금 실행 중인 줄 강조 (요구사항 3.3.2)
 *   파이썬   : 7단계에서 같은 줄 번호로 채운다
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';
import { getAlgorithm } from '../core/algorithms/index.js';
import { buildFlowchart, boxForAction } from './flowchart.js';

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

  // 순서도는 알고리즘 구조가 바뀔 때만 다시 만든다(강조는 setActive로 가볍게)
  let flow = null;
  let flowStructure = null;

  function activeLine() {
    const v = player.view();
    return v.empty ? 0 : v.line;
  }
  function activeAction() {
    const v = player.view();
    return v.empty ? null : v.action;
  }

  function draw() {
    const state = store.get();
    for (const b of tabButtons) b.setAttribute('aria-selected', String(b.dataset.view === state.codeView));

    const algo = findById(ALGORITHMS, state.algorithmId);
    const module = getAlgorithm(algo.id);
    const viewId = state.codeView;

    // --- 순서도 ---
    if (viewId === 'flow') {
      if (!flow || flowStructure !== algo.structure) {
        flow = buildFlowchart(algo.structure);
        flowStructure = algo.structure;
      }
      flow.setActive(boxForAction(activeAction(), algo.structure));
      fill(body, narration(), el('div', { style: 'overflow:auto' }, flow.svg));
      return;
    }

    // --- 의사코드 ---
    if (viewId === 'pseudo' && module && module.pseudo) {
      const line = activeLine();
      fill(body,
        narration(),
        el('pre.codeview', {},
          module.pseudo.map((text, i) =>
            el(`div.codeline${i + 1 === line ? '.codeline--active' : ''}`, {},
              el('span.codeline__no', {}, String(i + 1)),
              el('span', {}, text),
            ),
          ),
        ),
      );
      return;
    }

    // --- 파이썬 (준비 중) ---
    const v = VIEWS.find((x) => x.id === viewId) ?? VIEWS[1];
    fill(body,
      narration(),
      el('div.placeholder', {},
        el('strong', {}, `${v.name} 준비 중`),
        `${algo.name}의 파이썬 코드는 개발 다음 단계에서 채웁니다. ` +
        '의사코드·순서도 탭에서는 지금도 실행 위치가 강조됩니다.'),
    );
  }

  function narration() {
    const v = player.view();
    const algo = findById(ALGORITHMS, store.get().algorithmId);
    const text = v.empty ? `${algo.name}(${algo.en}) — ${algo.point}` : v.narration;
    return el('div.narration', {}, text);
  }

  store.subscribe(draw);
  player.subscribe(draw);
}
