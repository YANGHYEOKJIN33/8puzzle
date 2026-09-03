/**
 * 탐색 트리 (요구사항 4.1 ④) — 교과서의 트리 그림처럼, 탐색이 확장한 노드들을
 * 부모→자식으로 이어 보여 준다. 탐색이 진행되며 노드가 하나씩 자라나고,
 * 지금 검사 중인 노드와 해 경로가 강조된다.
 *
 * 화면을 모르는 계산(레이아웃)과 그리기를 한곳에 두되, 재생기의 "지금 장면"만 받는다.
 */
import { el } from './dom.js';
import { SIZE } from '../core/puzzle.js';

const NS = 'http://www.w3.org/2000/svg';
const X_GAP = 52;     // 형제 사이 가로 간격
const Y_GAP = 66;     // 깊이 한 단계 세로 간격
const PAD = 24;
const MAX_NODES = 160; // 너무 크면 성능·가독성을 위해 여기까지만

function svg(name, attrs = {}) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

/**
 * 지금 장면(view)까지 생성된 노드들로 트리를 그린다.
 * @param {object} view  재생기의 현재 장면
 * @param {string} evalTag 'depth' | 'h' | 'f' — 노드 옆 평가값 표시
 * @returns {HTMLElement} 스크롤 컨테이너 (그 안에 SVG)
 */
export function renderTree(view, evalTag) {
  const wrap = el('div.tree-wrap');
  if (view.empty) {
    wrap.append(el('div.open-empty', {}, '▶ 재생 또는 ⏭ 한 단계로 탐색을 시작하면 트리가 자라납니다.'));
    return wrap;
  }

  const nodes = view.nodes;
  // 이 시점까지 "생성된" 노드 = 처음 generated개. 노드 id는 순차 발급이므로 id로 자른다.
  const ids = Object.keys(nodes).map(Number).sort((a, b) => a - b);
  const rootId = ids[0];
  const generated = view.counters.generated;
  let visible = ids.slice(0, generated);
  let truncated = false;
  if (visible.length > MAX_NODES) { visible = visible.slice(0, MAX_NODES); truncated = true; }
  const visSet = new Set(visible);

  // 부모→자식 관계 (보이는 노드만)
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

  // 정돈된 트리 배치: 잎은 차례로, 부모는 자식들의 가운데 (반복적 후위순회)
  const pos = new Map();
  let leafX = 0;
  for (const root of roots.sort((a, b) => a - b)) {
    const stack = [[root, false]];
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

  let maxX = 0;
  let maxD = 0;
  for (const p of pos.values()) { maxX = Math.max(maxX, p.x); maxD = Math.max(maxD, p.depth); }
  const width = maxX * X_GAP + PAD * 2 + 40;
  const height = maxD * Y_GAP + PAD * 2 + 44;
  const cx = (id) => PAD + 20 + pos.get(id).x * X_GAP;
  const cy = (id) => PAD + pos.get(id).depth * Y_GAP;

  const root = svg('svg', { class: 'tree-svg', width, height, viewBox: `0 0 ${width} ${height}` });

  // 간선 먼저
  for (const id of visible) {
    const pid = nodes[id].parent;
    if (pid === null || !visSet.has(pid)) continue;
    root.append(svg('line', {
      class: 'tree-edge', x1: cx(pid), y1: cy(pid) + 16, x2: cx(id), y2: cy(id) - 16,
    }));
  }

  // 노드
  let currentEl = null;
  for (const id of visible) {
    const node = nodes[id];
    const onPath = view.pathIds.has(id) && view.finished;
    const isCurrent = id === view.node?.id;
    const g = svg('g', {
      class: `tree-node${isCurrent ? ' tree-node--current' : ''}${onPath ? ' tree-node--path' : ''}`,
      transform: `translate(${cx(id)}, ${cy(id)})`,
    });
    // 3x3 미니 격자
    const cell = 10;
    const boardW = cell * SIZE;
    g.append(svg('rect', { class: 'tree-box', x: -boardW / 2 - 2, y: -boardW / 2 - 2, width: boardW + 4, height: boardW + 4, rx: 3 }));
    node.state.forEach((t, i) => {
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      const x = -boardW / 2 + c * cell;
      const y = -boardW / 2 + r * cell;
      if (t !== 0) {
        const tx = svg('text', { class: 'tree-cell', x: x + cell / 2, y: y + cell / 2 });
        tx.textContent = String(t);
        g.append(tx);
      }
    });
    // 평가값 라벨 (교과서의 동그라미 숫자처럼)
    const val = evalTag === 'f' ? node.f : evalTag === 'h' ? node.h : node.depth;
    const label = svg('g', { class: 'tree-eval', transform: `translate(${-boardW / 2 - 12}, 0)` });
    label.append(svg('circle', { r: 9, cx: 0, cy: 0 }));
    const lt = svg('text', { x: 0, y: 0, class: 'tree-eval-text' });
    lt.textContent = String(val);
    label.append(lt);
    g.append(label);
    root.append(g);
    if (isCurrent) currentEl = g;
  }

  wrap.append(root);

  if (truncated) {
    wrap.append(el('p.panel__hint', { style: 'text-align:center' },
      `노드가 많아 처음 ${MAX_NODES}개까지만 그렸습니다.`));
  }

  // 현재 노드가 보이도록 스크롤 (다음 그리기 틀에서)
  requestAnimationFrame(() => {
    if (currentEl && currentEl.scrollIntoView) {
      currentEl.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  });

  return wrap;
}
