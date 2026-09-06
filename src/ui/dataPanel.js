/**
 * 자료구조 패널 (요구사항 4.1 ③ · 4.2) — 시각화의 핵심.
 *
 * 재생기의 현재 장면(view)을 받아 OPEN을 "자료구조 탭"과 같은 그림(관/통)으로 그린다.
 * 구조의 생김새가 곧 규칙이 되도록, 노드(배치)가 어느 쪽으로 들어가고 나가는지 보인다.
 *   큐(BFS)         : 양 끝이 뚫린 가로 관 — 왼쪽으로 넣고(push) 오른쪽으로 나간다(pop)
 *   우선순위 큐(A*)  : 같은 관 — 오른쪽(pop)에는 평가값이 가장 작은 노드가 온다
 *   스택(DFS)        : 오른쪽 한 곳만 뚫린 관 — 넣고 꺼내는 곳이 같다(LIFO)
 * 오른쪽 끝(다음에 나갈 것)은 파랑, 방금 넣은 것은 초록으로 강조한다(요구사항 4.2.2).
 */
import { el, fill } from './dom.js';
import { ALGORITHMS, STRUCTURE_LABEL, STRUCTURE_CHOICES, STRUCTURE_OF_ALGO } from '../app/config.js';
import { findById } from '../app/state.js';
import { miniBoard } from './miniBoard.js';
import { renderTree } from './treeView.js';
import { lessonAt } from '../app/lesson.js';

/* 정확한 용어를 앞세우고, 쉬운 말은 괄호로 덧붙인다 (요구사항 6.1.3) */
const COUNTERS = [
  { id: 'generated', label: '생성 노드',      sub: '만든 배치' },
  { id: 'expanded',  label: '확장 노드',      sub: '살펴본 배치' },
  { id: 'maxOpen',   label: 'OPEN 최대 크기', sub: '줄이 가장 길 때' },
  { id: 'depth',     label: '현재 깊이',      sub: '몇 번째 수' },
];

/** OPEN이 아주 길 때 화면이 느려지지 않도록 출구 쪽만 보여 준다 (요구사항 7.3.2) */
const MAX_IN_PIPE = 16;

/** CLOSED가 많이 쌓였을 때 방금 닫힌 쪽(뒤)만 보여 준다 */
const MAX_IN_CLOSED = 12;

export function mountDataPanel(root, store, player) {
  const body = el('div.panel__body');
  const counterValues = new Map();

  const foot = el('div.panel__foot', {},
    el('div.counters', {},
      COUNTERS.map((counter) => {
        const value = el('span.counter__value', {}, '–');
        counterValues.set(counter.id, value);
        return el('div.counter', { title: counter.sub },
          el('span.counter__label', {},
            counter.label,
            el('span.counter__sub', {}, ` · ${counter.sub}`)),
          value,
        );
      }),
    ),
  );

  fill(root,
    el('div.panel__head', {},
      el('span.panel__title', {}, '자료구조'),
      el('span.panel__hint', {}, 'OPEN 리스트와 탐색 트리'),
    ),
    body,
    foot,
  );

  /** 한 노드를 OPEN 항목으로 그린다. 알고리즘에 맞는 평가값을 꼬리표로 단다. */
  function openItem(nodes, id, { pushed = false, next = false, evalTag = 'depth' } = {}) {
    const node = nodes[id];
    const tag = evalTag === 'f' ? `f=${node.f}`
      : evalTag === 'h' ? `h=${node.h}`
      : `g=${node.depth}`;
    return el(`div.open-item${pushed ? '.open-item--pushed' : ''}${next ? '.open-item--next' : ''}`, {
      title: `깊이 ${node.depth} · g=${node.g}(지나온 비용) · h=${node.h}(남은 거리 어림값) · f=${node.f}`,
    },
      miniBoard(node.state, { moved: movedCell(nodes, node) }),
      el('span.open-item__tag', {}, tag),
    );
  }

  /**
   * OPEN을 "관/통" 모양 안에 그린다 (요청: 자료구조 탭처럼 구조를 이미지로).
   * 언제나 '다음에 나갈 것'이 오른쪽 끝(꺼내는 곳)에 오도록 정렬한다.
   *   큐(FIFO)      : 맨 앞이 다음 → 뒤집어 오른쪽 끝으로
   *   우선순위 큐    : 평가값이 가장 작은 것이 맨 앞 → 뒤집어 오른쪽 끝으로
   *   스택(LIFO)    : 맨 위(마지막에 넣은 것)가 다음 → 이미 오른쪽 끝이므로 그대로
   */
  function renderPipe(viewData, structureKey, evalTag) {
    const { openIds, nodes, highlight, action } = viewData;

    // 언덕 등반은 OPEN이 없다 — 이웃 후보들을 관 없이 한 줄로만 보여 준다
    if (structureKey === 'single') {
      const flow = el('div.open-flow');
      const pushedId = action === 'push' || action === 'init' ? highlight : null;
      if (openIds.length === 0) flow.append(el('div.open-empty', {}, '이웃 후보가 없어요'));
      else for (const id of openIds) flow.append(openItem(nodes, id, { pushed: id === pushedId, evalTag }));
      return el('div.open-pipe', {}, flow,
        el('div.pipe__note', {}, '이 중 h가 가장 작은 이웃으로 옮겨 가요'));
    }

    const stack = structureKey === 'stack';

    // 오른쪽 끝 = 다음에 나갈 것
    const ordered = stack ? openIds : [...openIds].reverse();

    const body = el('div.pipe__body');
    if (ordered.length === 0) {
      body.append(el('div.open-empty', {}, 'OPEN이 비었어요 (대기 목록 없음)'));
    } else {
      // 방금 넣은 항목만 초록으로 (pop/skip 장면에서는 강조 없음)
      const pushedId = action === 'push' || action === 'init' ? highlight : null;
      const nextId = ordered[ordered.length - 1];   // 오른쪽 끝
      const shown = ordered.length <= MAX_IN_PIPE ? ordered : ordered.slice(-MAX_IN_PIPE);
      if (ordered.length > MAX_IN_PIPE) {
        body.append(el('span.pipe__more', {}, `…${ordered.length - MAX_IN_PIPE}개 더`));
      }
      for (const id of shown) {
        body.append(openItem(nodes, id, { pushed: id === pushedId, next: id === nextId, evalTag }));
      }
    }

    const inCap = el('div.pipe__cap.pipe__cap--in', {},
      el('span.pipe__arrow', {}, '➜'),
      el('span.pipe__word', {}, '넣기 push'));
    const outCap = el('div.pipe__cap.pipe__cap--out', {},
      el('span.pipe__arrow', {}, '➜'),
      el('span.pipe__word', {}, '꺼내기 pop'));

    if (stack) {
      // 스택: 왼쪽은 막힌 바닥, 오른쪽 한 곳에서 넣고 꺼낸다
      return el('div.open-pipe.open-pipe--stack', {},
        el('div.pipe', {},
          el('div.pipe__cap.pipe__cap--floor', {}, el('span.pipe__word', {}, '바닥 막힘')),
          body,
          el('div.pipe__cap.pipe__cap--out', {},
            el('span.pipe__arrow', {}, '⬍'),
            el('span.pipe__word', {}, '넣고 꺼내는 곳')),
        ),
        pipeNote(structureKey, evalTag, nodes, openIds),
      );
    }
    return el('div.open-pipe', {},
      el('div.pipe', {}, inCap, body, outCap),
      pipeNote(structureKey, evalTag, nodes, openIds),
    );
  }

  /** 관 아래 한 줄 설명 — 지금 무엇이 왜 다음인지 (자료구조 탭의 안내와 같은 결) */
  function pipeNote(structureKey, evalTag, nodes, openIds) {
    if (openIds.length === 0) return null;
    if (structureKey === 'stack') {
      return el('div.pipe__note', {}, '마지막에 넣은 것이 먼저 나가요 (LIFO) — 오른쪽 끝이 다음 차례');
    }
    if (structureKey === 'priority') {
      const front = nodes[openIds[0]];
      const val = evalTag === 'f' ? `f=${front.f}` : `h=${front.h}`;
      return el('div.pipe__note.pipe__note--live', {},
        `오른쪽 끝(${val})이 가장 작아요 → 다음에 나갑니다 (pop)`);
    }
    return el('div.pipe__note', {}, '먼저 들어온 것이 먼저 나가요 (FIFO) — 오른쪽 끝이 다음 차례');
  }

  /**
   * CLOSED(닫힌 목록)를 "쌓이는 상자"로 그린다 (요청: OPEN뿐 아니라 CLOSED도 시각화).
   *
   * OPEN에서 꺼내(pop) 확장을 마친 노드는 CLOSED로 옮겨져 여기 쌓인다.
   * 방금 옮겨 온 노드(closedIds의 마지막)는 확장(make) 장면에서 주황으로 강조해
   * "OPEN → CLOSED"로 자료가 이동하는 순간을 눈으로 보게 한다.
   */
  function renderClosed(viewData, evalTag) {
    const { closedIds, nodes, action, node: currentNode } = viewData;
    // 방금 확장을 마쳐 CLOSED로 막 옮겨진 노드 = 그 장면에서 확장 중인 노드(current).
    // make/limit 장면에서만 강조해 "OPEN → CLOSED"로 옮겨지는 순간을 보인다.
    const justClosedId = (action === 'make' || action === 'limit') && currentNode ? currentNode.id : null;

    const box = el('div.closed-box__body');
    if (closedIds.length === 0) {
      box.append(el('div.closed-empty', {}, '아직 닫힌 노드가 없어요 — 노드를 확장하면 여기에 쌓여요'));
    } else {
      const shown = closedIds.length <= MAX_IN_CLOSED ? closedIds : closedIds.slice(-MAX_IN_CLOSED);
      if (closedIds.length > MAX_IN_CLOSED) {
        box.append(el('span.closed-more', {}, `…먼저 닫힌 ${closedIds.length - MAX_IN_CLOSED}개`));
      }
      for (const id of shown) {
        const node = nodes[id];
        const tag = evalTag === 'f' ? `f=${node.f}` : evalTag === 'h' ? `h=${node.h}` : `g=${node.depth}`;
        const fresh = id === justClosedId;
        box.append(el(`div.closed-item${fresh ? '.closed-item--fresh' : ''}`, {
          title: `이미 확장을 마친 노드 · 깊이 ${node.depth} · 다시 보지 않아요`,
        },
          miniBoard(node.state, { moved: movedCell(nodes, node) }),
          el('span.open-item__tag', {}, tag),
        ));
      }
    }

    return el('div.closed-box', {},
      el('div.closed-box__flow', {},
        el('span.closed-box__arrow', {}, '⬇'),
        el('span', {}, 'OPEN에서 꺼내 확장을 마친 노드가 여기 쌓여요')),
      box,
      el('div.pipe__note', {}, '집합(set)이라 순서는 없어요 — 이미 본 배치를 다시 안 보려고 모아 둡니다'),
    );
  }

  function draw(viewData) {
    const state = store.get();
    const algo = findById(ALGORITHMS, state.algorithmId);
    const structure = STRUCTURE_LABEL[algo.structure];

    // 카운터 갱신
    for (const counter of COUNTERS) {
      const v = viewData.empty ? '–' : String(viewData.counters[counter.id]);
      counterValues.get(counter.id).textContent = v;
    }

    if (viewData.empty) {
      fill(body,
        structurePicker(),
        el('div.placeholder', {},
          el('strong', {}, '아직 실행 전입니다'),
          '아래 ', el('strong', { style: 'color:var(--current)' }, '▶ 재생'),
          ' 또는 ', el('strong', {}, '⏭ 한 단계'), '를 눌러 탐색을 시작하세요.'),
      );
      return;
    }

    // 학습 3단계: 학생 코드의 OPEN/CLOSED는 파이썬 안에 있어 여기 그리지 않는다
    if (state.stageId === 'write') {
      fill(body,
        legend(),
        el('div.placeholder', {},
          el('strong', {}, '직접 작성한 코드의 해 경로'),
          '이 단계에서는 OPEN·CLOSED를 여러분의 파이썬 코드가 직접 관리합니다. ' +
          '퍼즐 판과 진행 막대로 찾은 경로를 재생해 보세요.'),
      );
      return;
    }

    const show = lessonAt(state.lessonStep).show;

    fill(body,
      show.picker ? structurePicker() : null,
      // 위: OPEN(대기 목록)
      show.open ? el('div.ds-section', {},
        el('div.inspect', {},
          algo.structure === 'single'
            ? el('span', {}, el('strong', {}, '이웃 노드 후보'), ` · ${viewData.openIds.length}개`)
            : el('span', {}, el('strong', {}, 'OPEN 리스트'), ' (대기 목록)',
                ` · ${structure.name} · ${viewData.openIds.length}개`),
          el('span.topbar__spacer'),
          legendInline(),
        ),
        el('div.open-wrap', {}, renderPipe(viewData, algo.structure, algo.evalTag)),
      ) : null,
      // 가운데: CLOSED(닫힌 목록) — OPEN에서 옮겨 온 노드가 쌓이는 것을 함께 보여 준다.
      // 경로만 확인하는 깊이 제한·반복 심화는 CLOSED를 두지 않으므로 그 사실을 알려 준다.
      show.open && algo.structure !== 'single' ? el('div.ds-section', {},
        el('div.inspect', {},
          el('span', {}, el('strong', {}, 'CLOSED'), ' (닫힌 목록)',
            algo.pathOnly ? ' · 안 씀' : ` · 집합 · ${viewData.closedSize}개`),
          el('span.topbar__spacer'),
          el('span.panel__hint', {}, '이미 확장을 마쳐 다시 보지 않는 노드'),
        ),
        algo.pathOnly
          ? el('div.closed-box__body', {},
              el('div.closed-empty', {},
                '이 방식은 CLOSED(전역 방문표)를 두지 않아요 — 대신 "지금 내려온 경로"에 같은 배치가 있는지만 확인합니다.'))
          : renderClosed(viewData, algo.evalTag),
      ) : null,
      // 아래: 탐색 트리
      show.tree ? el('div.ds-section.ds-section--tree', {},
        el('div.inspect', {},
          el('span', {}, el('strong', {}, '탐색 트리'), ' (Search Tree)'),
          el('span.topbar__spacer'),
          el('span.panel__hint', {}, '지금까지 만든 노드를 부모–자식으로 이은 그림')),
        renderTree(viewData, algo.evalTag),
      ) : null,
    );
  }

  player.subscribe(draw);
  // 탭·자료구조 선택 등 store 변화에도 다시 그린다(다음 단계를 밟지 않아도 전환되게)
  store.subscribe(() => draw(player.view()));

  // OPEN 자료구조 바꾸기 — 학습자가 직접 골라 다른 결과를 본다 (핵심 실험)
  function structurePicker() {
    const activeId = STRUCTURE_OF_ALGO[store.get().algorithmId] ?? null;
    const active = STRUCTURE_CHOICES.find((c) => c.id === activeId) ?? null;
    const chips = el('div.ds-picker', { role: 'group', 'aria-label': 'OPEN 자료구조 선택' },
      STRUCTURE_CHOICES.map((c) => el('button.pill.ds-chip', {
        type: 'button', 'aria-pressed': String(c.id === activeId), title: c.tip,
        onclick: () => store.set({ algorithmId: c.algo }),
      }, el('strong', {}, c.name), el('span.ds-chip__sub', {}, c.sub))));
    // 한 줄로 압축: 라벨 + 칩들 + 무엇이 되는지. 자세한 설명은 칩 툴팁(title)에.
    return el('div.ds-pick', {},
      el('span.ds-pick__label', {}, 'OPEN 자료구조 =', el('span.sr-only', {}, ' 바꾸기')),
      chips,
      active ? el('span.ds-pick__becomes', {}, `→ ${active.becomes}`) : null,
    );
  }

  function legendInline() {
    return el('span.ds-legend ds-legend--inline', {},
      el('span', {}, el('i.swatch.swatch--current'), '확장 중'),
      el('span', {}, el('i.swatch.swatch--open'), 'OPEN 삽입'),
      el('span', {}, el('i.swatch.swatch--path'), '해 경로'),
    );
  }

  function legend() {
    return el('div.ds-legend', {},
      el('span', {}, el('i.swatch.swatch--current'), '검사 중'),
      el('span', {}, el('i.swatch.swatch--open'), 'OPEN 삽입'),
      el('span', {}, el('i.swatch.swatch--closed'), 'CLOSED'),
      el('span', {}, el('i.swatch.swatch--path'), '해 경로'),
    );
  }
}

/** 부모와 견주어 이번에 움직인 칸(강조용)을 찾는다 */
function movedCell(nodes, node) {
  if (node.parent === null || !node.parentState) return -1;
  for (let i = 0; i < node.state.length; i += 1) {
    // 빈칸이 채워진 자리 = 타일이 새로 들어온 자리
    if (node.state[i] !== node.parentState[i] && node.state[i] !== 0) return i;
  }
  return -1;
}
