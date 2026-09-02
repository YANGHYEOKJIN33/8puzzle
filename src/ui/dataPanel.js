/**
 * 자료구조 패널 (요구사항 4.1 ③ · 4.2) — 시각화의 핵심.
 *
 * 재생기의 현재 장면(view)을 받아 OPEN을 알고리즘에 맞는 모양으로 그린다.
 *   큐(BFS)   : 가로 띠 — 앞에서 나가고 뒤로 들어온다
 *   스택(DFS) : 세로 더미 — 위에서 넣고 위에서 뺀다
 * 방금 넣은 항목은 초록으로 강조하고(요구사항 4.2.2), 카운터 4종을 항상 보여 준다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS, STRUCTURE_LABEL } from '../app/config.js';
import { findById } from '../app/state.js';
import { miniBoard } from './miniBoard.js';

const COUNTERS = [
  { id: 'generated', label: '생성한 노드' },
  { id: 'expanded',  label: '펼친 노드' },
  { id: 'maxOpen',   label: 'OPEN 최대' },
  { id: 'depth',     label: '현재 깊이' },
];

/** OPEN이 아주 길 때 화면이 느려지지 않도록 양 끝만 보여 준다 (요구사항 7.3.2) */
const HEAD = 10;
const TAIL = 10;

export function mountDataPanel(root, store, player) {
  const body = el('div.panel__body');
  const counterValues = new Map();

  const foot = el('div.panel__foot', {},
    el('div.counters', {},
      COUNTERS.map((counter) => {
        const value = el('span.counter__value', {}, '–');
        counterValues.set(counter.id, value);
        return el('div.counter', {},
          el('span.counter__label', {}, counter.label),
          value,
        );
      }),
    ),
  );

  fill(root,
    el('div.panel__head', {},
      el('span.panel__title', {}, '자료구조'),
      el('span.panel__hint', {}, 'OPEN · CLOSED'),
    ),
    body,
    foot,
  );

  /** 한 노드를 OPEN 항목으로 그린다. useF면 f=g+h를, 아니면 깊이를 꼬리표로 단다. */
  function openItem(nodes, id, { pushed = false, useF = false } = {}) {
    const node = nodes[id];
    const tag = useF ? `f=${node.f}` : `깊이 ${node.depth}`;
    return el(`div.open-item${pushed ? '.open-item--pushed' : ''}`, {
      title: `깊이 ${node.depth}, g=${node.g}, h=${node.h}, f=${node.f}`,   // 마우스 올림 미리보기 (요구사항 4.2.4)
    },
      miniBoard(node.state, { moved: movedCell(nodes, node) }),
      el('span.open-item__tag', {}, tag),
    );
  }

  function renderOpen(viewData, structureKey, useF) {
    const { openIds, nodes, highlight, action } = viewData;
    if (openIds.length === 0) {
      return el('div.open-flow', {}, el('div.open-empty', {}, 'OPEN이 비어 있습니다'));
    }
    const flow = el('div.open-flow');

    // 큐든 스택이든 가로 띠로 그려 화면 높이에 잘리지 않게 한다.
    // 언제나 '다음에 나갈 것'이 왼쪽에 오도록 정렬한다.
    //   큐(FIFO): 맨 앞이 다음 → 그대로
    //   스택(LIFO): 맨 위(마지막에 넣은 것)가 다음 → 뒤집어서 마지막을 왼쪽에
    const display = structureKey === 'stack' ? [...openIds].reverse() : openIds;

    // 방금 넣은 항목만 초록으로 (pop/skip 장면에서는 강조 없음)
    const pushedId = action === 'push' || action === 'init' ? highlight : null;
    const render = (id) => flow.append(openItem(nodes, id, { pushed: id === pushedId, useF }));

    if (display.length <= HEAD + TAIL + 1) {
      display.forEach(render);
    } else {
      display.slice(0, HEAD).forEach(render);
      flow.append(el('span.open-ellipsis', {}, `… ${display.length - HEAD - TAIL}개 더 …`));
      display.slice(-TAIL).forEach(render);
    }
    return flow;
  }

  player.subscribe((viewData) => {
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
        legend(),
        el('div.field', {}, el('span', {}, 'OPEN을 다루는 방식'), el('strong', {}, structure.name)),
        el('p.panel__hint', { style: 'margin:4px 0 12px' }, structure.hint),
        el('div.placeholder', {},
          el('strong', {}, '아직 실행 전입니다'),
          '아래 ', el('strong', { style: 'color:var(--current)' }, '▶ 재생'),
          ' 또는 ', el('strong', {}, '⏭ 한 단계'), '를 눌러 탐색을 시작하세요.'),
      );
      return;
    }

    const endLabel = algo.structure === 'stack'
      ? el('div.open-end-label', {}, el('span', {}, '← 맨 위 = 다음에 나감'), el('span', {}, '먼저 들어온 것 →'))
      : el('div.open-end-label', {}, el('span', {}, '← 다음에 나감'), el('span', {}, '나중에 들어옴 →'));

    fill(body,
      legend(),
      // OPEN 헤더 한 줄에 자료구조·개수·CLOSED 크기를 모아 세로 공간을 아낀다
      el('div.inspect', {},
        el('span', {}, el('strong', {}, `OPEN · ${structure.name}`), ` · ${viewData.openIds.length}개`),
        el('span.topbar__spacer'),
        el('span.closed-chip', {}, `CLOSED ${viewData.closedSize}개`),
      ),
      el('div.open-wrap', {}, renderOpen(viewData, algo.structure, algo.family === 'heuristic'), endLabel),
    );
  });

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
