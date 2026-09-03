/**
 * "자료구조 배우기" 방 — 스택·큐를 배운 적 없는 학생을 위한 손으로 해 보는 화면.
 *
 * 세 가지를 한 화면에 둡니다.
 *   ① 실생활 비유 한 줄 (매표소 줄 / 접시 더미 / 응급실)
 *   ② 직접 넣고 꺼내는 상자 — 넣은 순서와 나온 순서를 나란히 보여 준다
 *   ③ "다음에 나올 것은?" 맞히기 — 규칙을 스스로 확인하게 한다
 *
 * 마지막 쪽에서 같은 자료구조가 8-퍼즐 탐색의 대기 목록이 된다는 것으로 이어 줍니다.
 */
import { el, fill } from './dom.js';
import { DS_KINDS, dsKind, push, pop, nextOutIndex } from '../core/structures.js';
import { dsLessonAt } from '../app/dsLesson.js';
import { STRUCTURE_CHOICES } from '../app/config.js';

const LABELS = 'ABCDEFGHIJKLMN';
const KIND_IDS = DS_KINDS.map((k) => k.id);

export function mountDsRoom(root, store) {
  // 놀이터 상태는 화면에만 있는 값이라 store에 두지 않는다(새로 고치면 처음부터).
  let seq = 0;
  const boxes = { queue: [], stack: [], priority: [] };
  const trays = { queue: [], stack: [], priority: [] };   // 나온 순서
  let pushed = [];                                        // 넣은 순서(공통)
  let justIn = null;                                      // 방금 들어온 항목 id (초록 강조)
  let quizPick = null;                                    // 학생이 고른 답
  let message = null;                                     // 한 줄 안내
  const score = { right: 0, total: 0 };

  function makeItem() {
    const label = LABELS[seq % LABELS.length];
    seq += 1;
    return { id: `${label}-${seq}`, label, priority: 1 + Math.floor(Math.random() * 9) };
  }

  function resetAll() {
    for (const id of KIND_IDS) { boxes[id] = []; trays[id] = []; }
    pushed = [];
    seq = 0; justIn = null; quizPick = null; message = null;
    score.right = 0; score.total = 0;
  }

  /** 한 항목을 주어진 상자들에 넣는다 */
  function doPush(kindIds) {
    const item = makeItem();
    for (const id of kindIds) boxes[id] = push(id, boxes[id], item).items;
    pushed = [...pushed, item];
    justIn = item.id;
    quizPick = null;
    message = null;
    draw();
    setTimeout(() => { if (justIn === item.id) { justIn = null; draw(); } }, 420);
  }

  /** 주어진 상자들에서 하나씩 꺼낸다 */
  function doPop(kindIds) {
    let popped = null;
    for (const id of kindIds) {
      const result = pop(id, boxes[id]);
      if (!result.item) continue;
      boxes[id] = result.items;
      trays[id] = [...trays[id], result.item];
      popped = result.item;
    }
    if (!popped) message = { tone: 'warn', text: '상자가 비었어요. 먼저 넣기를 눌러 보세요.' };
    justIn = null;
    draw();
  }

  /** 맞히기 — 고른 항목이 규칙상 다음에 나갈 것인지 판정하고, 이어서 실제로 꺼낸다 */
  function answer(kindId, item) {
    const index = nextOutIndex(kindId, boxes[kindId]);
    const truth = boxes[kindId][index];
    const kind = dsKind(kindId);
    quizPick = item.id;
    score.total += 1;
    if (truth.id === item.id) {
      score.right += 1;
      message = { tone: 'ok', text: `맞았어요! ${kind.name}는 ${kind.rule}. 그래서 ${truth.label}가 나와요.` };
    } else {
      message = { tone: 'no', text: `아쉬워요. ${kind.name}는 ${kind.rule}. 그래서 ${truth.label}가 나와요.` };
    }
    draw();
    setTimeout(() => { quizPick = null; doPop([kindId]); }, 900);
  }

  /* ---------------------------------------------------------------- 그리기 */

  /** 상자 안의 항목 하나 */
  function chip(item, { kindId, isNext, small = false }) {
    return el(`div.dsitem${isNext ? '.dsitem--next' : ''}${item.id === justIn ? '.dsitem--in' : ''}${small ? '.dsitem--sm' : ''}`,
      { title: isNext ? '다음에 나갈 것' : '' },
      el('span.dsitem__label', {}, item.label),
      kindId === 'priority' ? el('span.dsitem__pri', {}, `급함 ${item.priority}`) : null,
    );
  }

  /** 상자 하나 — 큐·우선순위 큐는 가로줄, 스택은 세로 더미 */
  function boxView(kindId, { small = false } = {}) {
    const kind = dsKind(kindId);
    const items = boxes[kindId];
    const nextIndex = nextOutIndex(kindId, items);
    const lane = el(`div.dslane${kindId === 'stack' ? '.dslane--stack' : ''}`);

    if (items.length === 0) {
      lane.append(el('div.dsempty', {}, '비었어요'));
    } else {
      // 스택은 마지막에 넣은 것이 위로 오도록 뒤집어 그린다
      const order = kindId === 'stack' ? [...items].reverse() : items;
      for (const item of order) {
        lane.append(chip(item, { kindId, isNext: items[nextIndex] === item, small }));
      }
    }

    return el('div.dsbox', {},
      el('div.dsbox__ends', {},
        el('span.dsbox__end', {}, kindId === 'stack' ? '⬆ 여기로 넣고, 여기서 꺼내요' : `⬅ ${kind.outWord}`),
        el('span.topbar__spacer'),
        kindId === 'stack' ? null : el('span.dsbox__end', {}, `${kind.inWord} ➡`),
      ),
      lane,
    );
  }

  /** 넣은 순서 / 나온 순서 두 줄 — 규칙의 결과를 눈으로 견주게 한다 */
  function orderRows(kindId) {
    const row = (label, list, hint) => el('div.dsorder', {},
      el('span.dsorder__label', {}, label),
      list.length === 0
        ? el('span.dsorder__hint', {}, hint)
        : el('div.dsorder__list', {}, list.map((it) => chip(it, { kindId: 'none', isNext: false, small: true }))),
    );
    return el('div.dsorders', {},
      row('넣은 순서', pushed, '아직 없어요'),
      row('나온 순서', trays[kindId], '아직 없어요'),
    );
  }

  /** "다음에 나올 것은?" 맞히기 줄 */
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
        el('div.action-card__word', {}, message.tone === 'ok' ? '맞았어요!' : message.tone === 'no' ? '다시 볼까요' : '알려 드려요'),
        el('div.action-card__plain', {}, message.text)));
  }

  function opButtons(kindIds) {
    return el('div.dsops', {},
      el('button.ctrl.ctrl--primary', { type: 'button', onclick: () => doPush(kindIds) }, '📥 넣기'),
      el('button.ctrl', { type: 'button', onclick: () => doPop(kindIds) }, '👆 꺼내기'),
      el('button.pill', { type: 'button', onclick: () => { resetAll(); draw(); } }, '↺ 비우기'),
    );
  }

  /* ------------------------------------------------------------- 쪽별 화면 */

  /** ①②③ 쪽 — 자료구조 하나를 손으로 다뤄 본다 */
  function playView(kindId) {
    const kind = dsKind(kindId);
    return el('div.dsroom__grid', {},
      el('section.panel', {},
        el('div.panel__head', {},
          el('span.panel__title', {}, `${kind.icon} ${kind.name} (${kind.sub})`),
          el('span.panel__hint', {}, kind.ruleEn)),
        el('div.panel__body', {},
          messageCard(kind),
          boxView(kindId),
          quiz(kindId),
          orderRows(kindId)),
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
          el('div.dsorder', {},
            el('span.dsorder__label', {}, '넣은 순서'),
            pushed.length === 0
              ? el('span.dsorder__hint', {}, '아직 없어요 — 아래 넣기를 눌러 보세요')
              : el('div.dsorder__list', {}, pushed.map((it) => chip(it, { kindId: 'none', isNext: false, small: true })))),
          el('div.dstrio', {}, DS_KINDS.map((kind) => el('div.dstrio__cell', {},
            el('div.dstrio__cap', {},
              el('strong', {}, `${kind.icon} ${kind.name}`),
              el('span', {}, kind.ruleShort)),
            boxView(kind.id, { small: true }),
            el('div.dsorder', {},
              el('span.dsorder__label', {}, '나온 순서'),
              trays[kind.id].length === 0
                ? el('span.dsorder__hint', {}, '아직 없어요')
                : el('div.dsorder__list', {}, trays[kind.id].map((it) => chip(it, { kindId: 'none', isNext: false, small: true })))),
          ))),
          el('p.dsbridge__note', {},
            '같은 것을 같은 순서로 넣었는데 나오는 순서가 다르죠? ',
            '순서를 정하는 건 “어떤 상자에 담았는가”예요.'),
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
            '8-퍼즐 탐색에서 “대기 목록”이 바로 이 상자예요. ',
            '상자를 바꾸면 컴퓨터가 찾아가는 순서가 통째로 달라집니다.'),
        ),
      ),
    );
  }

  /* --------------------------------------------------------------- 조립 */

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
