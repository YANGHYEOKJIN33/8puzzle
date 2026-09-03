/**
 * 코드 패널 (요구사항 3.3 · 4.1 ②).
 * 순서도와 의사코드를 한 화면에 나란히 두고, 실행 중인 도형과 줄을 함께 강조한다.
 * 학습 2·3단계에서는 빈칸 채우기 / 직접 작성 화면으로 바뀐다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';
import { getAlgorithm } from '../core/algorithms/index.js';
import { buildFlowchart, boxForAction } from './flowchart.js';
import { renderFill } from './fillPanel.js';
import { buildWritePanel } from './writePanel.js';
import { createPyRunner } from '../app/pyRunner.js';


export function mountCodePanel(root, store, player) {
  const body = el('div.panel__body');
  const headHint = el('span.panel__hint', {}, '순서도와 코드를 같이 봐요');

  fill(root,
    el('div.panel__head', {}, el('span.panel__title', {}, '순서도 · 코드'), headHint),
    body,
  );

  // 순서도는 알고리즘 구조가 바뀔 때만 다시 만든다(강조는 setActive로 가볍게)
  let flow = null;
  let flowStructure = null;

  // 학습 2단계(빈칸 채우기)가 기억할 값
  const fillLocal = { exerciseId: 'blind-pop', choices: {}, feedback: null, render: () => draw() };

  // 학습 3단계(직접 작성) 화면은 텍스트영역 유지를 위해 한 번만 만든다.
  // 실행기는 갈아 끼울 수 있다(테스트에서 window.__PY_RUNNER__로 주입).
  let writeEl = null;
  const getRunner = () => (globalThis.__PY_RUNNER__ ?? createPyRunner());

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

    // 학습 2단계: 빈칸 채우기 화면
    if (state.stageId === 'fill') {
      headHint.textContent = '빈칸을 채우고 실행해 봐요';
      renderFill(body, store, player, fillLocal);
      return;
    }

    // 학습 3단계: 직접 작성 편집기 (텍스트영역 유지를 위해 한 번만 만든다)
    if (state.stageId === 'write') {
      headHint.textContent = '파이썬으로 직접 만들어요';
      if (!writeEl) writeEl = buildWritePanel(store, player, getRunner());
      if (body.firstChild !== writeEl) body.replaceChildren(writeEl);
      return;
    }

    // 기본: 순서도와 의사코드를 한 화면에 나란히 (요청 1.5)
    headHint.textContent = '순서도와 코드를 같이 봐요';
    const algo = findById(ALGORITHMS, state.algorithmId);
    const module = getAlgorithm(algo.id);

    if (!flow || flowStructure !== algo.structure) {
      flow = buildFlowchart(algo.structure);
      flowStructure = algo.structure;
    }
    flow.setActive(boxForAction(activeAction(), algo.structure));

    const line = activeLine();
    const codeLines = module && module.pseudo
      ? el('pre.codeview', {}, module.pseudo.map((text, i) =>
          el(`div.codeline${i + 1 === line ? '.codeline--active' : ''}`, {},
            el('span.codeline__no', {}, String(i + 1)),
            el('span', {}, text))))
      : el('div.placeholder', {}, '코드를 준비 중입니다.');

    fill(body,
      el('div.codeduo', {},
        el('div.codeduo__col', {},
          el('div.codeduo__cap', {}, '순서도 — 지금 여기'),
          el('div.codeduo__scroll', {}, flow.svg)),
        el('div.codeduo__col', {},
          el('div.codeduo__cap', {}, '코드 — 지금 이 줄'),
          el('div.codeduo__scroll', {}, codeLines)),
      ),
    );
  }

  store.subscribe(draw);
  // 재생 중에는 매 프레임 다시 그린다(줄·도형 강조, 해설). 단 빈칸 채우기 화면은
  // 프레임마다 다시 그리면 드롭다운이 초기화되므로, 그때는 건너뛴다.
  player.subscribe(() => { const st = store.get().stageId; if (st !== 'fill' && st !== 'write') draw(); });
}
