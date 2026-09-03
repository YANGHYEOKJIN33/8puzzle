/**
 * 코드 패널 (요구사항 3.3 · 4.1 ②).
 * 순서도와 의사코드를 한 화면에 나란히 두고, 실행 중인 도형과 줄을 함께 강조한다.
 * 학습 2·3단계에서는 빈칸 채우기 / 직접 작성 화면으로 바뀐다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS, STRUCTURE_CHOICES } from '../app/config.js';
import { findById } from '../app/state.js';
import { lessonAt } from '../app/lesson.js';
import { getAlgorithm } from '../core/algorithms/index.js';
import { buildFlowchart, boxForAction } from './flowchart.js';
import { renderFill } from './fillPanel.js';
import { buildWritePanel } from './writePanel.js';
import { createPyRunner } from '../app/pyRunner.js';


export function mountCodePanel(root, store, player, { onCompare = () => {}, onGlossary = () => {} } = {}) {
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

    // 마지막 쪽: 오늘 배운 것 정리
    if (lessonAt(state.lessonStep).show.summary) {
      body.dataset.mode = 'flow';
      headHint.textContent = '오늘 배운 것을 한 장으로';
      fill(body, summaryView());
      return;
    }

    // 학습 2단계: 빈칸 채우기 화면
    if (state.stageId === 'fill') {
      body.dataset.mode = 'flow';
      headHint.textContent = '빈칸을 채우고 실행해 봐요';
      renderFill(body, store, player, fillLocal);
      return;
    }

    // 학습 3단계: 직접 작성 편집기 (텍스트영역 유지를 위해 한 번만 만든다)
    if (state.stageId === 'write') {
      body.dataset.mode = 'duo';
      headHint.textContent = '파이썬으로 직접 만들어요';
      if (!writeEl) writeEl = buildWritePanel(store, player, getRunner());
      if (body.firstChild !== writeEl) body.replaceChildren(writeEl);
      return;
    }

    // 기본: 순서도와 의사코드를 한 화면에 나란히 (요청 1.5)
    body.dataset.mode = 'duo';
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
          el('div.codeduo__scroll.codeduo__scroll--flow', {}, flow.svg)),
        el('div.codeduo__col', {},
          el('div.codeduo__cap', {}, '코드 — 지금 이 줄'),
          el('div.codeduo__scroll', {}, codeLines)),
      ),
    );
  }

  /** 마무리 정리 화면 — 수업의 "정리" 단계 */
  function summaryView() {
    const learned = [
      ['상태 · 노드', '퍼즐 배치 하나가 상태, 탐색이 만든 상태 하나가 노드예요.'],
      ['확장 (expand)', '노드 하나에서 갈 수 있는 자식 노드를 모두 만드는 일이에요.'],
      ['OPEN · CLOSED', '아직 확장 안 한 노드는 OPEN, 이미 확장을 마친 노드는 CLOSED.'],
      ['탐색 트리', '만든 노드를 부모–자식으로 이으면 탐색이 지나온 길이 보여요.'],
      ['휴리스틱 h(n)', '목표까지 얼마나 남았을지 어림잡은 값. A*는 f = g + h를 씁니다.'],
    ];
    return el('div.wrap', {},
      el('h3.wrap__title', {}, '✅ 오늘 배운 낱말'),
      el('dl.wrap__list', {}, learned.flatMap(([term, desc]) => [
        el('dt.wrap__term', {}, term),
        el('dd.wrap__desc', {}, desc),
      ])),
      el('h3.wrap__title', {}, '🔗 자료구조 하나가 알고리즘을 정한다'),
      el('div.wrap__scroll', {},
        el('table.compare__table', {},
          el('thead', {}, el('tr', {},
            el('th', {}, 'OPEN 자료구조'), el('th', {}, '알고리즘'), el('th', {}, '성질'))),
          el('tbody', {}, STRUCTURE_CHOICES.map((c) => {
            const algo = findById(ALGORITHMS, c.algo);
            return el('tr.compare__row', { onclick: () => store.set({ algorithmId: c.algo, lessonStep: 3 }) },
              el('td', {}, c.name, ' ', el('span.dsitem__pri', {}, c.sub)),
              el('td', {}, algo.name),
              el('td', {}, algo.props ? `${algo.props.complete} · ${algo.props.optimal}` : ''));
          })))),
      el('p.panel__hint', {}, '표의 줄을 누르면 그 알고리즘으로 4쪽(자료구조 비교)에 갑니다.'),
      el('h3.wrap__title', {}, '👉 더 해 볼 것'),
      el('div.wrap__actions', {},
        el('button.pill.ctrl--primary', { type: 'button', onclick: () => onCompare() }, '⚖ 7가지 알고리즘 비교하기'),
        el('button.pill', { type: 'button', onclick: () => onGlossary() }, '📖 용어 다시 보기'),
        el('button.pill', { type: 'button',
          onclick: () => store.set({ presetId: 'hard', lessonStep: 3 }) }, '🎯 더 어려운 배치로 다시'),
        el('button.pill', { type: 'button',
          onclick: () => store.set({ mode: 'ds', dsStep: 0 }) }, '📦 자료구조 복습'),
      ),
    );
  }

  store.subscribe(draw);
  // 재생 중에는 매 프레임 다시 그린다(줄·도형 강조, 해설). 단 빈칸 채우기 화면은
  // 프레임마다 다시 그리면 드롭다운이 초기화되므로, 그때는 건너뛴다.
  player.subscribe(() => { const st = store.get().stageId; if (st !== 'fill' && st !== 'write') draw(); });
}
