/**
 * "자료구조 배우기" 방 — 스택·큐를 배운 적 없는 학생을 위한 손으로 해 보는 화면.
 *
 * 화면을 왼쪽에서 오른쪽으로 흐르게 만들었습니다.
 *
 *     넣은 순서  →   [ 자 료 구 조 ]   →  나온 순서
 *
 * 가운데 그림은 "생김새"가 곧 규칙이 되도록 그립니다.
 *   큐          : 양 끝이 뚫린 가로 관 — 왼쪽으로 들어와 오른쪽으로 나간다
 *   스택        : 위만 뚫린 세로 통   — 넣는 곳과 꺼내는 곳이 같다
 *   우선순위 큐 : 새치기가 되는 관    — 급한 것이 앞으로 끼어든다
 *
 * 마지막 쪽에서 같은 자료구조가 8-퍼즐 탐색의 대기 목록이 된다는 것으로 이어 줍니다.
 */
import { el, fill } from './dom.js';
import { DS_KINDS, dsKind, push, pop, nextOutIndex } from '../core/structures.js';
import { dsLessonAt } from '../app/dsLesson.js';
import { STRUCTURE_CHOICES } from '../app/config.js';

const LABELS = 'ABCDEFGHIJKLMN';
const KIND_IDS = DS_KINDS.map((k) => k.id);

/** 그림에 한 번에 보여 줄 최대 개수 — 넘치면 "…개 더"로 접는다 (세로 통은 자리가 좁다) */
const MAX_SHOWN = { queue: 7, priority: 7, stack: 4 };

export function mountDsRoom(root, store) {
  // 놀이터 상태는 화면에만 있는 값이라 store에 두지 않는다(새로 고치면 처음부터).
  let seq = 0;
  const boxes = { queue: [], stack: [], priority: [] };
  const trays = { queue: [], stack: [], priority: [] };   // 나온 순서
  let pushed = [];                                        // 넣은 순서(공통)
  let justIn = null;                                      // 방금 들어온 것 (초록)
  let justOut = null;                                     // 방금 나간 것 (주황)
  let bumped = new Set();                                 // 새치기 당한 것들 (우선순위 큐)
  let quizPick = null;
  let message = null;
  const score = { right: 0, total: 0 };

  function makeItem() {
    const label = LABELS[seq % LABELS.length];
    seq += 1;
    return { id: `${label}-${seq}`, label, priority: 1 + Math.floor(Math.random() * 9) };
  }

  function resetAll() {
    for (const id of KIND_IDS) { boxes[id] = []; trays[id] = []; }
    pushed = [];
    seq = 0; justIn = null; justOut = null; bumped = new Set();
    quizPick = null; message = null;
    score.right = 0; score.total = 0;
  }

  /* ------------------------------------------------------------ 넣기 · 꺼내기 */

  function doPush(kindIds) {
    const item = makeItem();
    let jumpedOver = [];

    for (const id of kindIds) {
      const before = boxes[id];
      const result = push(id, before, item);
      // 우선순위 큐에서 몇 개를 제치고 끼어들었는지 (요청 ④ — 새치기를 눈에 보이게)
      if (id === 'priority') jumpedOver = before.slice(result.index);
      boxes[id] = result.items;
    }

    pushed = [...pushed, item];
    justIn = item.id;
    justOut = null;
    bumped = new Set(jumpedOver.map((it) => it.id));
    quizPick = null;

    message = jumpedOver.length > 0
      ? { tone: 'ok', text: `${item.label}는 급함 ${item.priority}이라 앞의 ${jumpedOver.length}개를 제치고 끼어들었어요!` }
      : null;

    draw();
    setTimeout(() => {
      if (justIn === item.id) { justIn = null; bumped = new Set(); draw(); }
    }, 700);
  }

  function doPop(kindIds) {
    let popped = null;
    for (const id of kindIds) {
      const result = pop(id, boxes[id]);
      if (!result.item) continue;
      boxes[id] = result.items;
      trays[id] = [...trays[id], result.item];
      popped = result.item;
    }
    justIn = null;
    bumped = new Set();
    if (!popped) {
      message = { tone: 'warn', text: '구조가 비었어요. 먼저 넣기를 눌러 보세요.' };
    } else {
      justOut = popped.id;
      setTimeout(() => { if (justOut === popped.id) { justOut = null; draw(); } }, 700);
    }
    draw();
  }

  /** 맞히기 — 고른 것이 규칙상 다음에 나갈 것인지 판정하고, 이어서 실제로 꺼낸다 */
  function answer(kindId, item) {
    const truth = boxes[kindId][nextOutIndex(kindId, boxes[kindId])];
    const kind = dsKind(kindId);
    quizPick = item.id;
    score.total += 1;
    const right = truth.id === item.id;
    if (right) score.right += 1;
    message = {
      tone: right ? 'ok' : 'no',
      text: `${right ? '맞았어요!' : '아쉬워요.'} ${kind.name}는 ${kind.rule}. 그래서 ${truth.label}가 나와요.`,
    };
    draw();
    setTimeout(() => { quizPick = null; doPop([kindId]); }, 900);
  }

  /* ---------------------------------------------------------------- 조각 그리기 */

  /** 항목 하나 — 글자 하나로 알아보게 크게. 우선순위 큐면 급한 정도를 함께 보인다. */
  function chip(item, { kindId = null, isNext = false, size = '', bump = true } = {}) {
    const classes = [
      'div.dsitem',
      isNext ? '.dsitem--next' : '',
      item.id === justIn ? '.dsitem--in' : '',
      item.id === justOut ? '.dsitem--out' : '',
      // 밀려남은 구조 안에서만 보여 준다 — 옆 기둥까지 흔들리면 어수선하다
      bump && bumped.has(item.id) ? '.dsitem--bumped' : '',
      size ? `.dsitem--${size}` : '',
    ].join('');
    return el(classes, { title: isNext ? '다음에 나갈 것' : '' },
      el('span.dsitem__label', {}, item.label),
      kindId === 'priority'
        ? el('span.dsitem__pri', {}, el('b', {}, String(item.priority)), '번')
        : null,
    );
  }

  /**
   * 화면에 그릴 순서 — 어느 구조든 "다음에 나갈 것"이 출구 쪽에 오게 뒤집는다.
   *   가로 관 : 출구가 오른쪽이므로 display의 끝이 출구
   *   세로 통 : 출구가 위쪽이므로 display의 앞이 출구
   * 접을 때는 언제나 출구에서 먼 것(오래 기다릴 것)부터 접는다.
   */
  function shownOrder(kindId, items) {
    const max = MAX_SHOWN[kindId] ?? 7;
    const display = [...items].reverse();
    if (display.length <= max) return { display, hidden: 0 };
    const kept = kindId === 'stack' ? display.slice(0, max) : display.slice(-max);
    return { display: kept, hidden: display.length - max };
  }

  /**
   * 가운데 그림 — 구조의 "생김새"가 곧 규칙 (요청 ③).
   *   큐·우선순위 큐 : 양 끝이 뚫린 가로 관
   *   스택           : 위만 뚫린 세로 통
   */
  function shape(kindId, { size = '' } = {}) {
    const items = boxes[kindId];
    const nextIndex = nextOutIndex(kindId, items);
    const nextItem = nextIndex === -1 ? null : items[nextIndex];
    const { display, hidden } = shownOrder(kindId, items);

    const chips = display.map((it) => chip(it, { kindId, isNext: it === nextItem, size }));
    const more = hidden > 0 ? el('span.dsmore', {}, `…${hidden}개 더`) : null;
    const empty = items.length === 0 ? el('div.dsempty', {}, '비었어요') : null;

    if (kindId === 'stack') {
      // 세로 통 — 위쪽 한 곳만 뚫려 있다
      return el('div.dsshape.dsshape--can', {},
        el('div.dscan__mouth', {},
          el('span.dscan__mouth-arrow', {}, '⬍'),
          el('span', {}, '넣는 곳 = 꺼내는 곳 (여기 한 곳뿐)')),
        el('div.dscan__body', {}, empty, chips, more),
        el('div.dscan__floor', {}, '바닥 — 막혀 있어요'),
      );
    }

    const note = kindId === 'priority'
      ? (nextItem
          ? `지금은 ${nextItem.label}가 ${nextItem.priority}번으로 가장 급해요 → 다음에 나갑니다`
          : '이 관은 새치기가 됩니다 — 번호가 작을수록 급해서 앞으로 끼어들어요.')
      : '이 관은 한 줄로만 흘러요 — 끼어들기가 없어요.';

    return el('div.dsshape.dsshape--tube', {},
      el('div.dstube', {},
        el('div.dstube__cap.dstube__cap--in', {},
          el('span.dstube__cap-arrow', {}, '➜'),
          el('span.dstube__cap-word', {}, '넣는 곳')),
        el('div.dstube__body', {}, more, empty, chips),
        el('div.dstube__cap.dstube__cap--out', {},
          el('span.dstube__cap-arrow', {}, '➜'),
          el('span.dstube__cap-word', {}, '꺼내는 곳')),
      ),
      el(`div.dstube__note${kindId === 'priority' && nextItem ? '.dstube__note--live' : ''}`, {}, note),
    );
  }

  /** 옆 기둥 — 넣은 순서(왼쪽) / 나온 순서(오른쪽). 위가 먼저, 아래가 나중. */
  function column(title, icon, list, hint) {
    return el('div.dscol', {},
      el('div.dscol__head', {}, el('span.dscol__icon', { 'aria-hidden': 'true' }, icon), title),
      list.length === 0
        ? el('div.dscol__hint', {}, hint)
        : el('div.dscol__list', {}, list.map((it) => chip(it, { size: 'sm', bump: false }))),
      el('div.dscol__foot', {}, list.length === 0 ? '' : `${list.length}개`),
    );
  }

  /** 맞히기 한 줄 */
  function quiz(kindId) {
    const items = boxes[kindId];
    if (items.length < 2) {
      return el('div.dsquiz.dsquiz--off', {},
        el('span.dsquiz__q', {}, '🤔 두 개 이상 넣으면 “다음에 나올 것은?” 맞히기가 나와요.'));
    }
    return el('div.dsquiz', {},
      el('span.dsquiz__q', {}, '🤔 다음에 꺼내면 무엇이 나올까요?'),
      el('div.dsquiz__picks', {}, items.map((item) =>
        el(`button.pill.dsquiz__pick${quizPick === item.id ? '.dsquiz__pick--picked' : ''}`, {
          type: 'button', onclick: () => answer(kindId, item),
        }, item.label))),
      el('span.topbar__spacer'),
      el('span.dsquiz__score', {}, `맞힌 개수 ${score.right} / ${score.total}`),
    );
  }

  /** 위쪽 한 줄 — 실생활 비유 그림 + 규칙, 또는 방금 일어난 일 */
  function messageCard(kind) {
    if (!message) {
      return el('div.action-card.action-card--intro', {},
        el('div.action-card__icon', { 'aria-hidden': 'true' }, kind.icon),
        el('div.action-card__body', {},
          el('div.action-card__word', {}, `${kind.name} · ${kind.rule}`),
          el('div.action-card__plain', {}, kind.story)));
    }
    const icon = message.tone === 'ok' ? '🎉' : message.tone === 'no' ? '🤔' : '📦';
    return el('div.action-card', { 'data-tone': message.tone },
      el('div.action-card__icon', { 'aria-hidden': 'true' }, icon),
      el('div.action-card__body', {},
        el('div.action-card__word', {},
          message.tone === 'ok' ? '이렇게 돼요!' : message.tone === 'no' ? '다시 볼까요' : '알려 드려요'),
        el('div.action-card__plain', {}, message.text)));
  }

  function opButtons(kindIds) {
    return el('div.dsops', {},
      el('button.ctrl.ctrl--primary', { type: 'button', onclick: () => doPush(kindIds) }, '📥 넣기'),
      el('button.ctrl', { type: 'button', onclick: () => doPop(kindIds) }, '👆 꺼내기'),
      el('button.pill', { type: 'button', onclick: () => { resetAll(); draw(); } }, '↺ 비우기'),
    );
  }

  /* ------------------------------------------------------------------ 쪽별 화면 */

  /** ①②③ 쪽 — 넣은 순서 → 자료구조 → 나온 순서 (요청 ②) */
  function playView(kindId) {
    const kind = dsKind(kindId);
    return el('div.dsroom__grid', {},
      el('section.panel', {},
        el('div.panel__head', {},
          el('span.panel__title', {}, `${kind.icon} ${kind.name} (${kind.sub})`),
          el('span.panel__hint', {}, kind.ruleEn)),
        el('div.panel__body', {},
          messageCard(kind),
          el('div.dsflow', {},
            column('넣은 순서', '📥', pushed, '아직 없어요'),
            el('div.dsflow__arrow', { 'aria-hidden': 'true' }, '➜'),
            el('div.dsstage', {},
              el('div.dsstage__cap', {}, kind.ruleShort),
              shape(kindId)),
            el('div.dsflow__arrow', { 'aria-hidden': 'true' }, '➜'),
            column('나온 순서', '📤', trays[kindId], '아직 없어요'),
          ),
          quiz(kindId)),
        el('div.panel__foot', {}, opButtons([kindId])),
      ),
    );
  }

  /** ④ 쪽 — 같은 것을 같은 순서로 넣고, 셋이 어떻게 다른지 나란히 본다 */
  function compareView() {
    return el('div.dsroom__grid', {},
      el('section.panel', {},
        el('div.panel__head', {},
          el('span.panel__title', {}, '⚖ 셋을 나란히'),
          el('span.panel__hint', {}, '같은 것을 같은 순서로 넣었어요')),
        el('div.panel__body', {},
          el('div.dstrio', {},
            column('넣은 순서', '📥', pushed, '아직 없어요'),
            el('div.dstrio__boxes', {}, DS_KINDS.map((kind) => el('div.dstrio__cell', {},
              el('div.dstrio__cap', {},
                el('strong', {}, `${kind.icon} ${kind.name}`),
                el('span', {}, kind.ruleShort)),
              shape(kind.id, { size: 'sm' }),
              el('div.dstrio__out', {},
                el('span.dscol__head', {}, '📤 나온 순서'),
                trays[kind.id].length === 0
                  ? el('span.dscol__hint', {}, '아직 없어요')
                  : el('div.dstrio__outlist', {}, trays[kind.id].map((it) => chip(it, { size: 'sm', bump: false })))),
            ))),
          ),
          el('p.dsbridge__note', {},
            '같은 것을 같은 순서로 넣었는데 나오는 순서가 다르죠? ',
            '순서를 정하는 건 “어떤 구조에 담았는가”예요.'),
        ),
        el('div.panel__foot', {}, opButtons(KIND_IDS)),
      ),
    );
  }

  /** ⑤ 쪽 — 자료구조 → 탐색 알고리즘으로 이어 준다 */
  function bridgeView() {
    return el('div.dsroom__grid', {},
      el('section.panel', {},
        el('div.panel__head', {},
          el('span.panel__title', {}, '🔗 자료구조 → 탐색 방법'),
          el('span.panel__hint', {}, '대기 목록을 무엇으로 두느냐가 탐색 방법을 정해요')),
        el('div.panel__body', {},
          el('div.dsbridge', {}, STRUCTURE_CHOICES.map((choice) => {
            const kind = dsKind(choice.id === 'queue' ? 'queue' : choice.id === 'stack' ? 'stack' : 'priority');
            return el('div.dsbridge__row', {},
              el('div.dsbridge__from', {},
                el('span.dsbridge__icon', { 'aria-hidden': 'true' }, kind.icon),
                el('div', {},
                  el('strong', {}, choice.name), ' ', el('span.dsitem__pri', {}, choice.sub),
                  el('div.dsbridge__rule', {}, kind.ruleShort))),
              el('span.dsbridge__arrow', { 'aria-hidden': 'true' }, '→'),
              el('div.dsbridge__to', {},
                el('strong', {}, choice.becomes),
                el('div.dsbridge__why', {}, choice.tip)),
              el('button.pill.ctrl--primary', {
                type: 'button',
                onclick: () => store.set({ mode: 'search', algorithmId: choice.algo, lessonStep: 3 }),
              }, '이 탐색 보러 가기'),
            );
          })),
          el('p.dsbridge__note', {},
            '8-퍼즐 탐색에서 “대기 목록”이 바로 이 구조예요. ',
            '구조를 바꾸면 컴퓨터가 찾아가는 순서가 통째로 달라집니다.'),
        ),
      ),
    );
  }

  /* ----------------------------------------------------------------- 조립 */

  function draw() {
    const state = store.get();
    if (state.mode !== 'ds') return;
    const step = dsLessonAt(state.dsStep);
    if (step.view === 'compare') fill(root, compareView());
    else if (step.view === 'bridge') fill(root, bridgeView());
    else fill(root, playView(step.kind));
  }

  let lastStep = -1;
  let lastMode = null;
  store.subscribe((state) => {
    if (state.mode !== 'ds') { lastMode = state.mode; return; }
    // 쪽을 옮기거나 탭에 처음 들어오면 놀이터를 깨끗이 비우고 시작한다
    if (state.dsStep !== lastStep || lastMode !== 'ds') {
      lastStep = state.dsStep;
      lastMode = state.mode;
      resetAll();
    }
    draw();
  });
}
