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

  // 동작을 아이콘 + 쉬운 한 문장으로 (요청 ④ — 의사코드를 몰라도 무슨 일인지 알게)
  const ACTION_VIS = {
    init:      { icon: '🚩', word: '시작',      plain: '첫 배치를 대기 목록(OPEN)에 넣어요.' },
    pop:       { icon: '👆', word: '꺼내기',    plain: '대기 목록에서 배치 하나를 꺼내 살펴봐요.' },
    goal:      { icon: '🎉', word: '찾았다!',   plain: '목표에 도착! 여기까지 온 길이 정답이에요.' },
    make:      { icon: '🌱', word: '펼치기',    plain: '지금 배치에서 갈 수 있는 다음 배치들을 만들어요.' },
    push:      { icon: '📥', word: '넣기',      plain: '새 배치를 대기 목록에 넣어 나중에 살펴봐요.' },
    skip:      { icon: '🚪', word: '건너뛰기',  plain: '이미 본 배치라서 넣지 않아요.' },
    exhausted: { icon: '🔚', word: '끝',        plain: '더 볼 게 없어요. 이 방법으론 못 찾았어요.' },
    limit:     { icon: '✋', word: '멈춤',      plain: '너무 많이 살펴봐서 여기서 멈춰요.' },
    restart:   { icon: '🔁', word: '다시',      plain: '더 깊이 볼 수 있게 처음부터 다시 시작해요.' },
    path:      { icon: '🚶', word: '따라가기',  plain: '찾은 정답 길을 따라가요.' },
  };

  function narration() {
    const v = player.view();
    const algo = findById(ALGORITHMS, store.get().algorithmId);
    if (v.empty) {
      return el('div.action-card.action-card--intro', {},
        el('div.action-card__body', {},
          el('div.action-card__word', {}, `${algo.name}`),
          el('div.action-card__plain', {}, `${algo.point}. ▶ 재생 또는 ⏭ 한 단계로 시작하세요.`)));
    }
    const vis = ACTION_VIS[v.action] ?? { icon: '•', word: '진행', plain: v.narration };
    return el('div.action-card', { 'data-action': v.action },
      el('div.action-card__icon', { 'aria-hidden': 'true' }, vis.icon),
      el('div.action-card__body', {},
        el('div.action-card__word', {}, vis.word),
        el('div.action-card__plain', {}, vis.plain),
        el('div.action-card__detail', {}, v.narration)));
  }

  store.subscribe(draw);
  // 재생 중에는 매 프레임 다시 그린다(줄·도형 강조, 해설). 단 빈칸 채우기 화면은
  // 프레임마다 다시 그리면 드롭다운이 초기화되므로, 그때는 건너뛴다.
  player.subscribe(() => { const st = store.get().stageId; if (st !== 'fill' && st !== 'write') draw(); });
}
