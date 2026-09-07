/**
 * 코드 패널 (요구사항 3.3 · 4.1 ②).
 * 순서도와 의사코드를 한 화면에 나란히 두고, 실행 중인 도형과 줄을 함께 강조한다.
 * 학습 2·3단계에서는 빈칸 채우기 / 직접 작성 화면으로 바뀐다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS, STRUCTURE_CHOICES } from '../app/config.js';
import { findById } from '../app/state.js';
import { currentStep } from '../app/lesson.js';
import { getAlgorithm } from '../core/algorithms/index.js';
import { buildFlowchart, boxForAction } from './flowchart.js';
import { renderFill } from './fillPanel.js';
import { buildWritePanel } from './writePanel.js';
import { createPyRunner } from '../app/pyRunner.js';
import { pyMapFor } from '../app/pyMap.js';
import { QUIZ } from '../app/quiz.js';


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

  // 이해 확인 퀴즈에서 고른 답 (문제 index → 고른 보기 index). 다시 그려도 유지.
  const quizChoice = {};

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

    // 정리 탭: 오늘 배운 것 정리
    if (currentStep(state).show.summary) {
      body.dataset.mode = 'flow';
      headHint.textContent = '오늘 배운 것을 한 장으로';
      fill(body, summaryView());
      return;
    }

    // 정리 탭: 이해 확인 퀴즈
    if (currentStep(state).show.quiz) {
      body.dataset.mode = 'flow';
      headHint.textContent = '문제로 이해를 확인해요';
      renderQuiz();
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

    const algo = findById(ALGORITHMS, state.algorithmId);
    const module = getAlgorithm(algo.id);

    // 10쪽: 순서도만 크게 + "왜 이 모양인가" 설명 (의사코드는 옆에 두지 않는다 — 혼란 방지)
    if (currentStep(state).show.flowwhy) {
      body.dataset.mode = 'flow';
      headHint.textContent = '순서도가 왜 이 모양인지';
      renderFlowWhy(algo);
      return;
    }

    // 11쪽: 의사코드만 한 줄씩 + 줄별 설명 (순서도는 옆에 두지 않는다)
    if (currentStep(state).show.coderead) {
      body.dataset.mode = 'flow';
      headHint.textContent = '의사코드를 한 줄씩';
      renderCodeRead(algo, module);
      return;
    }

    // 알고리즘 ④쪽: 의사코드 ↔ 파이썬 대치
    if (currentStep(state).show.pymap) {
      body.dataset.mode = 'flow';
      headHint.textContent = '의사코드와 파이썬을 나란히';
      renderPyMap(algo, module);
      return;
    }

    // (fallback) 순서도와 의사코드를 나란히 — 현재 레슨 흐름에서는 쓰지 않는다.
    body.dataset.mode = 'duo';
    headHint.textContent = '순서도와 코드를 같이 봐요';

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

  /** 순서도 쪽 — 순서도 + 도형별 설명. 한 단계씩 밟으면 지금 도형과 그 설명이 함께 켜진다(하나하나). */
  function renderFlowWhy(algo) {
    if (!flow || flowStructure !== algo.structure) {
      flow = buildFlowchart(algo.structure);
      flowStructure = algo.structure;
    }
    const activeBox = boxForAction(activeAction(), algo.structure);
    flow.setActive(activeBox);
    fill(body,
      el('div.flowwhy', {},
        el('div.flowwhy__chart', {}, flow.svg),
        el('div.flowwhy__side', {},
          el('div.flowwhy__cap', {}, '🔎 순서도를 하나씩 따라가요 (⏭ 밟으면 지금 도형·설명이 켜져요)'),
          el('ul.flowwhy__list', {}, flowWhyItems(algo.structure).map(([shape, why, box]) =>
            el(`li.flowwhy__item${box && box === activeBox ? '.flowwhy__item--active' : ''}`, {},
              el('span.flowwhy__shape', {}, shape),
              el('span.flowwhy__why', {}, why)))),
        ),
      ),
    );
  }

  /** 11쪽 — 의사코드를 한 줄씩, 줄마다 하는 일·이유. 밟으면 실행 중인 줄이 강조된다. */
  function renderCodeRead(algo, module) {
    const line = activeLine();
    const pseudo = (module && module.pseudo) || [];
    const notes = (module && module.notes) || [];
    fill(body,
      el('div.coderead', {},
        el('div.coderead__cap', {}, `📖 ${algo.name} — 코드를 한 줄씩 읽어요`),
        el('ol.coderead__list', {}, pseudo.map((text, i) =>
          el(`li.coderead__row${i + 1 === line ? '.coderead__row--active' : ''}`, {},
            el('span.coderead__no', {}, String(i + 1)),
            // 들여쓰기(맨 앞 공백)는 남기고, 정렬용으로 벌려 둔 가운데 공백만 좁힌다
            el('code.coderead__code', {}, text.replace(/(\S) {2,}/g, '$1  ')),
            el('span.coderead__note', {}, notes[i] || '')))),
        el('p.coderead__hint', {}, '⏭ 한 단계를 누르면 지금 실행 중인 줄이 파랗게 강조돼요.'),
      ),
    );
  }

  /** 알고리즘 ④쪽 — 의사코드 한 줄 ↔ 파이썬 한 줄. 밟으면 양쪽에서 같은 줄이 켜진다. */
  function renderPyMap(algo, module) {
    const line = activeLine();
    const pseudo = (module && module.pseudo) || [];
    const map = pyMapFor(algo.id);
    const py = map.py || [];
    const rows = pseudo.map((ps, i) => {
      const active = i + 1 === line;
      const core = i === map.coreLine;
      return el(`li.pymap__row${active ? '.pymap__row--active' : ''}${core ? '.pymap__row--core' : ''}`, {},
        el('code.pymap__ps', {}, ps.replace(/(\S) {2,}/g, '$1 ')),
        el('span.pymap__arrow', {}, '→'),
        el('code.pymap__py', {}, py[i] || ''));
    });
    const swap = map.swap ? el('div.pymap__swap', {},
      el('span.pymap__swaplabel', {}, `🔑 핵심 한 줄 바꿔 보기 — ${map.swap.label}`),
      el('select.pymap__select', {
        'aria-label': map.swap.label,
        onchange: (e) => store.set({ mode: 'algo', algoTab: e.target.value, algoStep: 3 }),
      }, map.swap.options.map((o) => el('option', { value: o.algoTab, selected: o.algoTab === algo.id }, o.text))),
    ) : null;
    fill(body,
      el('div.pymap', {},
        el('div.pymap__cap', {}, `🐍 ${algo.name} — 의사코드 ↔ 파이썬`),
        el('div.pymap__legend', {}, el('span', {}, '의사코드(사람 말에 가까움)'), el('span', {}, '파이썬(컴퓨터가 실행)')),
        el('ol.pymap__list', {}, rows),
        map.coreWhy ? el('div.pymap__corewhy', {}, `🔑 ${map.coreWhy}`) : null,
        swap,
        el('p.coderead__hint', {}, '⏭ 한 단계를 누르면 양쪽에서 같은 줄이 파랗게 켜지고, 오른쪽 판·OPEN이 함께 움직여요.'),
      ),
    );
  }

  /** 이해 확인 퀴즈 — 답을 고르면 바로 정오답과 이유를 보여 준다. */
  function renderQuiz() {
    const answered = Object.keys(quizChoice).length;
    const correct = QUIZ.reduce((n, q, i) => n + (quizChoice[i] != null && q.options[quizChoice[i]].ok ? 1 : 0), 0);
    fill(body,
      el('div.quiz', {},
        el('div.quiz__cap', {}, '✅ 이해 확인'),
        el('div.quiz__score', {}, `푼 문제 ${answered}/${QUIZ.length} · 맞힌 개수 ${correct}`),
        ...QUIZ.map((q, i) => {
          const chosen = quizChoice[i];
          const done = chosen != null;
          return el('div.quiz__item', {},
            el('div.quiz__q', {}, `${i + 1}. ${q.q}`),
            el('div.quiz__opts', {}, q.options.map((o, j) => {
              const cls = done ? (o.ok ? '.quiz__opt--ok' : (j === chosen ? '.quiz__opt--no' : '')) : '';
              return el(`button.pill.quiz__opt${cls}`, {
                type: 'button', disabled: done,
                onclick: () => { quizChoice[i] = j; draw(); },
              }, o.text);
            })),
            done ? el('div.quiz__why', {}, (q.options[chosen].ok ? '✓ 맞았어요! ' : '✗ 다시 볼까요 — ') + q.why) : null,
          );
        }),
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
            return el('tr.compare__row', { onclick: () => store.set({ mode: 'algo', algoTab: c.algo, algoStep: 0 }) },
              el('td', {}, c.name, ' ', el('span.dsitem__pri', {}, c.sub)),
              el('td', {}, algo.name),
              el('td', {}, algo.props ? `${algo.props.complete} · ${algo.props.optimal}` : ''));
          })))),
      el('p.panel__hint', {}, '표의 줄을 누르면 그 알고리즘 탭으로 갑니다.'),
      el('h3.wrap__title', {}, '👉 더 해 볼 것'),
      el('div.wrap__actions', {},
        el('button.pill.ctrl--primary', { type: 'button', onclick: () => onCompare() }, '⚖ 7가지 알고리즘 비교하기'),
        el('button.pill', { type: 'button', onclick: () => onGlossary() }, '📖 용어 다시 보기'),
        el('button.pill', { type: 'button',
          onclick: () => store.set({ presetId: 'hard', mode: 'algo', algoStep: 0 }) }, '🎯 더 어려운 배치로 다시'),
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

/**
 * 순서도의 각 도형이 "왜 그 자리에 있는지"를 한 줄씩. (레슨 10쪽)
 * 큐·스택·우선순위 큐는 같은 그래프 탐색 순서도를 쓰므로 설명도 같고,
 * 언덕 등반(single)만 순서도가 달라 따로 둔다.
 */
function flowWhyItems(structure) {
  if (structure === 'single') {
    return [
      ['시작', '탐색 목록(OPEN) 없이 "지금 상태" 하나만 들고 출발해요. 국소 탐색이라서요.', 'start'],
      ['◇ 목표인가?', '지금 상태가 목표면 바로 끝내려고 먼저 확인해요.', 'checkGoal'],
      ['□ 이웃의 h 재기', '멀리 안 보고 바로 옆 이웃만 만들어 각자의 h(남은 거리 어림값)를 재요.', 'evaluate'],
      ['□ 가장 나은 이웃', 'h가 가장 작은(가장 좋아 보이는) 이웃 하나를 골라요.', 'choose'],
      ['◇ 더 나은가?', '그 이웃이 지금보다 낫지 않으면 멈춰요 — 되돌아가지 않아 지역 최적에 갇힐 수 있어요.', 'checkBetter'],
      ['↩ 되돌이 화살표', '더 나으면 그리로 옮겨 다시 반복해요. 한 걸음씩 "언덕"을 오르는 셈이에요.', 'move'],
    ];
  }
  const take = structure === 'stack' ? '맨 위에서'
    : structure === 'priority' ? '평가값이 가장 작은 것을'
    : '맨 앞에서';
  return [
    ['시작 (둥근 끝)', 'OPEN에 시작 노드를 넣고 CLOSED는 빈 채로 출발해요. 둥근 끝 도형은 "시작·끝"을 뜻해요.', 'start'],
    ['◇ OPEN이 비었는가?', '더 볼 노드가 없으면 실패로 끝내야 하니, 반복을 돌기 전에 이걸 먼저 확인해요. 마름모는 "판단"이에요.', 'checkEmpty'],
    ['□ 노드 꺼내기 (pop)', `OPEN에서 ${take} 노드를 하나 꺼내요. 어느 쪽을 꺼내느냐가 알고리즘(BFS·DFS·A*)을 정해요.`, 'pop'],
    ['◇ 목표인가?', '꺼낸 노드가 목표면 더 펼칠 필요 없이 바로 끝내려고, 꺼낸 직후에 확인해요.', 'checkGoal'],
    ['□ CLOSED에 넣고 확장', '목표가 아니면 "봤다"고 표시(CLOSED)한 뒤 자식을 만들어요. 표시해 둬야 같은 배치를 또 안 봐요.', 'expand'],
    ['□ 자식을 OPEN에 넣기', '새로 만든 자식을 다음에 볼 후보로 OPEN에 쌓아요.', 'push'],
    ['↩ 되돌이 화살표', '다시 "OPEN이 비었는가?"로 올라가 반복해요. 한 번에 노드 하나씩 펼치니 목표를 찾을 때까지 되풀이가 필요해요.', 'loop'],
  ];
}
