/**
 * 탐색 트리 (요구사항 4.1 ④) — 교과서의 A* 트리 그림처럼, 탐색이 확장한 노드들을
 * 부모→자식으로 이어 8-퍼즐 미니 배치로 보여 준다.
 *
 * "어떤 순서로 진행되는지"가 보이도록:
 *  - 확장을 마친 노드에는 확장 차례(①②③…)를 매긴다 → 큐/스택/우선순위가 다음에 무엇을
 *    고르는지, 트리를 훑는 순서가 어떻게 다른지 한눈에 보인다.
 *  - 색으로 상태를 구분한다: 지금(주황) · 다음에 꺼낼 것(파랑) · 대기 OPEN(초록) ·
 *    완료 CLOSED(회색) · 해 경로(주황 테).
 */
import { el } from './dom.js';
import { SIZE } from '../core/puzzle.js';

const NS = 'http://www.w3.org/2000/svg';
const X_GAP = 56;     // 형제 사이 가로 간격
const Y_GAP = 72;     // 깊이 한 단계 세로 간격
const PAD = 26;
const MAX_NODES = 160;

function svg(name, attrs = {}) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

function evalOf(node, evalTag) {
  return evalTag === 'f' ? node.f : evalTag === 'h' ? node.h : node.depth;
}

/** 지금 OPEN에서 다음에 꺼낼(pop) 노드 id — 자료구조에 따라 다르다 */
function nextToPop(view, structure, evalTag) {
  const open = view.openIds;
  if (!open || open.length === 0) return null;
  if (structure === 'single') return null;
  if (structure === 'stack') return open[open.length - 1];   // 마지막에 넣은 것
  if (structure === 'priority') {
    let best = open[0], bv = evalOf(view.nodes[best], evalTag);
    for (const id of open) { const v = evalOf(view.nodes[id], evalTag); if (v < bv) { bv = v; best = id; } }
    return best;
  }
  return open[0];   // 큐: 맨 앞(먼저 넣은 것)
}

function legend() {
  const item = (cls, text) => el('span.treelg__item', {}, el('i', { class: `treelg__dot ${cls}` }), text);
  return el('div.treelg', {},
    el('span.treelg__item', {}, el('i.treelg__num', {}, '①'), '확장 순서'),
    item('treelg__dot--now', '지금'),
    item('treelg__dot--next', '다음'),
    item('treelg__dot--open', '대기(OPEN)'),
    item('treelg__dot--closed', '완료(CLOSED)'),
  );
}

/**
 * 지금 장면(view)까지 생성된 노드들로 트리를 그린다.
 * @param {object} view     재생기의 현재 장면
 * @param {string} evalTag  'depth' | 'h' | 'f' — 노드의 평가값 표시
 * @param {string} [structure] 'queue'|'stack'|'priority'|'single' — "다음에 꺼낼 것" 계산용
 */
export function renderTree(view, evalTag, structure) {
  const wrap = el('div.tree-wrap');
  if (view.empty) {
    wrap.append(el('div.open-empty', {}, '▶ 재생 또는 ⏭ 한 단계로 탐색을 시작하면 트리가 자라납니다.'));
    return wrap;
  }

  const nodes = view.nodes;
  const ids = Object.keys(nodes).map(Number).sort((a, b) => a - b);
  const generated = view.counters.generated;
  let visible = ids.slice(0, generated);
  let truncated = false;
  if (visible.length > MAX_NODES) { visible = visible.slice(0, MAX_NODES); truncated = true; }
  const visSet = new Set(visible);

  // 상태 집합 — 확장 차례(closedIds 순서)·대기·지금·다음
  const closedOrder = new Map();
  (view.closedIds || []).forEach((id, i) => closedOrder.set(id, i + 1));
  const openSet = new Set(view.openIds || []);
  const currentId = view.node ? view.node.id : null;
  const nextId = nextToPop(view, structure, evalTag);

  // 부모→자식
  const children = new Map();
  const roots = [];
  for (const id of visible) {
    const pid = nodes[id].parent;
    if (pid !== null && visSet.has(pid)) {
      if (!children.has(pid)) children.set(pid, []);
      children.get(pid).push(id);
    } else roots.push(id);
  }
  for (const arr of children.values()) arr.sort((a, b) => a - b);

  // 정돈된 배치 (반복적 후위순회)
  const pos = new Map();
  let leafX = 0;
  for (const rootId of roots.sort((a, b) => a - b)) {
    const stack = [[rootId, false]];
    while (stack.length) {
      const [id, done] = stack.pop();
      const kids = children.get(id) || [];
      if (done || kids.length === 0) {
        const x = kids.length === 0
          ? leafX++
          : (pos.get(kids[0]).x + pos.get(kids[kids.length - 1]).x) / 2;
        pos.set(id, { x, depth: nodes[id].depth });
      } else {
        stack.push([id, true]);
        for (let i = kids.length - 1; i >= 0; i -= 1) stack.push([kids[i], false]);
      }
    }
  }

  let maxX = 0, maxD = 0;
  for (const p of pos.values()) { maxX = Math.max(maxX, p.x); maxD = Math.max(maxD, p.depth); }
  const width = maxX * X_GAP + PAD * 2 + 44;
  const height = maxD * Y_GAP + PAD * 2 + 48;
  const cx = (id) => PAD + 22 + pos.get(id).x * X_GAP;
  const cy = (id) => PAD + pos.get(id).depth * Y_GAP;

  const root = svg('svg', { class: 'tree-svg', width, height, viewBox: `0 0 ${width} ${height}` });

  // 간선
  for (const id of visible) {
    const pid = nodes[id].parent;
    if (pid === null || !visSet.has(pid)) continue;
    root.append(svg('line', {
      class: 'tree-edge', x1: cx(pid), y1: cy(pid) + 18, x2: cx(id), y2: cy(id) - 18,
    }));
  }

  const cell = 11;
  const boardW = cell * SIZE;
  let currentEl = null;

  for (const id of visible) {
    const node = nodes[id];
    const onPath = view.pathIds.has(id) && view.finished;
    const isCurrent = id === currentId;
    const isNext = id === nextId && !isCurrent;
    const order = closedOrder.get(id);
    const isClosed = order != null;
    const isOpen = openSet.has(id);

    const stateClass = onPath ? ' tree-node--path'
      : isCurrent ? ' tree-node--current'
      : isNext ? ' tree-node--next'
      : isClosed ? ' tree-node--closed'
      : isOpen ? ' tree-node--open'
      : '';

    const g = svg('g', { class: `tree-node${stateClass}`, transform: `translate(${cx(id)}, ${cy(id)})` });
    g.append(svg('rect', {
      class: 'tree-box', x: -boardW / 2 - 2, y: -boardW / 2 - 2, width: boardW + 4, height: boardW + 4, rx: 3,
    }));
    node.state.forEach((t, i) => {
      if (t === 0) return;
      const r = Math.floor(i / SIZE), c = i % SIZE;
      const tx = svg('text', { class: 'tree-cell', x: -boardW / 2 + c * cell + cell / 2, y: -boardW / 2 + r * cell + cell / 2 });
      tx.textContent = String(t);
      g.append(tx);
    });

    // 왼쪽 아래: 평가값(f/h/g)
    const val = evalOf(node, evalTag);
    const evalG = svg('g', { class: 'tree-eval', transform: `translate(${-boardW / 2 - 11}, ${boardW / 2 - 2})` });
    evalG.append(svg('circle', { r: 9, cx: 0, cy: 0 }));
    const et = svg('text', { x: 0, y: 0, class: 'tree-eval-text' });
    et.textContent = String(val);
    evalG.append(et);
    g.append(evalG);

    // 오른쪽 위: 확장 차례(①②③…) — 이 순서가 곧 "트리를 훑는 순서"
    if (isClosed) {
      const ordG = svg('g', { class: 'tree-order', transform: `translate(${boardW / 2 + 6}, ${-boardW / 2 + 1})` });
      ordG.append(svg('circle', { r: 8.5, cx: 0, cy: 0 }));
      const ot = svg('text', { x: 0, y: 0, class: 'tree-order-text' });
      ot.textContent = String(order);
      ordG.append(ot);
      g.append(ordG);
    }

    root.append(g);
    if (isCurrent || (isNext && !currentEl)) currentEl = g;
  }

  const scroller = el('div.tree-scroll');
  scroller.append(root);
  if (truncated) {
    scroller.append(el('p.panel__hint', { style: 'text-align:center' },
      `노드가 많아 처음 ${MAX_NODES}개까지만 그렸습니다.`));
  }
  wrap.append(legend(), scroller);

  requestAnimationFrame(() => {
    if (currentEl && currentEl.scrollIntoView) currentEl.scrollIntoView({ block: 'nearest', inline: 'center' });
  });

  return wrap;
}
