/**
 * 순서도 (요구사항 3.3.1) — 그래프 탐색의 제어 흐름을 도형으로 보여 준다.
 * BFS·DFS는 흐름이 같으므로 순서도 하나를 공유하고, "OPEN에서 어느 쪽을 꺼내는가"만
 * 글자로 달리 적는다. 실행 중에는 지금 위치한 도형을 강조한다.
 *
 * 순수 SVG를 손으로 그려 의존성이 없고, 색은 CSS 변수라 다크 모드에서도 맞는다.
 */
const NS = 'http://www.w3.org/2000/svg';

function svgEl(name, attrs = {}, text = null) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== null) node.textContent = text;
  return node;
}

/** 도형 하나(사각형/마름모/둥근끝)를 그리고 가운데에 글자를 넣는다 */
function box(id, shape, cx, cy, w, h, lines) {
  const g = svgEl('g', { 'data-box': id, class: 'flow-box' });
  if (shape === 'diamond') {
    g.append(svgEl('polygon', {
      class: 'flow-shape',
      points: `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`,
    }));
  } else {
    g.append(svgEl('rect', {
      class: 'flow-shape',
      x: cx - w / 2, y: cy - h / 2, width: w, height: h,
      rx: shape === 'terminal' ? h / 2 : 6,
    }));
  }
  const list = Array.isArray(lines) ? lines : [lines];
  const startY = cy - ((list.length - 1) * 7);
  list.forEach((line, i) => {
    g.append(svgEl('text', {
      class: 'flow-text', x: cx, y: startY + i * 14,
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
    }, line));
  });
  return g;
}

function edge(points, { label = null, dashed = false } = {}) {
  const g = svgEl('g', {});
  g.append(svgEl('polyline', {
    class: `flow-edge${dashed ? ' flow-edge--loop' : ''}`,
    points: points.map((p) => p.join(',')).join(' '),
    fill: 'none', 'marker-end': 'url(#flow-arrow)',
  }));
  if (label) {
    // 라벨을 선 시작점에 그대로 두면 도형(마름모) 뒤에 가려진다.
    // 선이 나아가는 방향으로 조금 밀어 도형 바깥에 놓는다.
    const [lx, ly] = points[0];
    const [nx, ny] = points[1] ?? points[0];
    const goingDown = ny > ly;
    const x = goingDown ? lx + 8 : lx + 10;
    const y = goingDown ? ly + 15 : ly - 6;
    g.append(svgEl('text', { class: 'flow-edge-label', x, y }, label));
  }
  return g;
}

/**
 * @param {'queue'|'stack'} structure  OPEN을 꺼내는 쪽 문구를 정한다
 * @returns {{ svg: SVGElement, setActive(boxId: string|null): void }}
 */
export function buildFlowchart(structure) {
  if (structure === 'single') return buildHillFlowchart();
  const take = structure === 'stack' ? '맨 위'
    : structure === 'priority' ? '평가값이 가장 작은 것'
    : '맨 앞';
  const put = structure === 'stack' ? '위'
    : structure === 'priority' ? '평가값 자리'
    : '뒤';

  const W = 320;
  const H = 430;
  const cx = 120;          // 본 흐름의 가운데 x
  const bw = 176;
  const bh = 40;
  const rows = [26, 100, 174, 248, 322, 388];   // 각 행의 중심 y

  const svg = svgEl('svg', {
    class: 'flowchart', viewBox: `0 0 ${W} ${H}`, width: '100%',
    role: 'img', 'aria-label': '그래프 탐색 순서도',
  });

  // 화살표 머리 정의
  const defs = svgEl('defs');
  const marker = svgEl('marker', {
    id: 'flow-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5,
    markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
  });
  marker.append(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'flow-arrow-head' }));
  defs.append(marker);
  svg.append(defs);

  // 도형들
  const boxes = [
    box('start',      'terminal', cx, rows[0], bw, bh, '시작 · OPEN에 시작 노드'),
    box('checkEmpty', 'diamond',  cx, rows[1], bw, bh + 8, 'OPEN이 비었는가?'),
    box('pop',        'process',  cx, rows[2], bw, bh,
      structure === 'priority' ? 'OPEN에서 평가값이 가장 작은 n을 꺼낸다' : `OPEN의 ${take}에서 n을 꺼낸다`),
    box('checkGoal',  'diamond',  cx, rows[3], bw, bh + 8, 'n이 목표인가?'),
    box('expand',     'process',  cx, rows[4], bw, bh, ['n을 CLOSED에 넣고', '자식들을 만든다']),
    box('push',       'process',  cx, rows[5], bw, bh,
      structure === 'priority' ? ['자식을 평가값 순서 자리에', 'OPEN에 끼워 넣는다'] : [`새 자식을 OPEN의 ${put}에 넣는다`]),
    box('fail',       'terminal', 262, rows[1], 96, bh, '실패 · 해 없음'),
    box('success',    'terminal', 262, rows[3], 96, bh, '성공 · 경로 반환'),
  ];

  // 연결선
  const edges = [
    edge([[cx, rows[0] + bh / 2], [cx, rows[1] - (bh + 8) / 2]]),
    edge([[cx, rows[1] + (bh + 8) / 2], [cx, rows[2] - bh / 2]], { label: '아니오' }),
    edge([[cx + bw / 2, rows[1]], [262, rows[1]]], { label: '예' }),
    edge([[cx, rows[2] + bh / 2], [cx, rows[3] - (bh + 8) / 2]]),
    edge([[cx, rows[3] + (bh + 8) / 2], [cx, rows[4] - bh / 2]], { label: '아니오' }),
    edge([[cx + bw / 2, rows[3]], [262, rows[3]]], { label: '예' }),
    edge([[cx, rows[4] + bh / 2], [cx, rows[5] - bh / 2]]),
    // 되돌이 화살표: push → 왼쪽으로 → 위로 → checkEmpty 왼쪽
    edge([[cx - bw / 2, rows[5]], [20, rows[5]], [20, rows[1]], [cx - bw / 2, rows[1]]], { dashed: true }),
  ];

  edges.forEach((e) => svg.append(e));
  boxes.forEach((b) => svg.append(b));

  let activeId = null;
  return {
    svg,
    setActive(boxId) {
      if (activeId === boxId) return;
      activeId = boxId;
      for (const b of svg.querySelectorAll('.flow-box')) {
        b.classList.toggle('flow-box--active', b.dataset.box === boxId);
      }
    },
  };
}

/** 언덕 등반 전용 순서도 (OPEN이 없다) */
function buildHillFlowchart() {
  const W = 320;
  const H = 430;
  const cx = 120;
  const bw = 176;
  const bh = 40;
  const rows = [26, 100, 174, 248, 322, 388];

  const svg = svgEl('svg', {
    class: 'flowchart', viewBox: `0 0 ${W} ${H}`, width: '100%',
    role: 'img', 'aria-label': '언덕 등반 순서도',
  });
  const defs = svgEl('defs');
  const marker = svgEl('marker', {
    id: 'flow-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5,
    markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
  });
  marker.append(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'flow-arrow-head' }));
  defs.append(marker);
  svg.append(defs);

  const boxes = [
    box('start',    'terminal', cx, rows[0], bw, bh, '시작 노드를 현재로'),
    box('checkGoal', 'diamond', cx, rows[1], bw, bh + 8, '현재가 목표인가?'),
    box('evaluate', 'process',  cx, rows[2], bw, bh, ['이웃들을 만들어', '각자의 h를 잰다']),
    box('choose',   'process',  cx, rows[3], bw, bh, 'h가 가장 작은 이웃을 고른다'),
    box('checkBetter', 'diamond', cx, rows[4], bw, bh + 8, '현재보다 나은가?'),
    box('move',     'process',  cx, rows[5], bw, bh, '현재 ← 그 이웃'),
    box('success',  'terminal', 262, rows[1], 96, bh, '성공'),
    box('stuck',    'terminal', 262, rows[4], 96, bh, '멈춤 · 지역 최적'),
  ];
  const edges = [
    edge([[cx, rows[0] + bh / 2], [cx, rows[1] - (bh + 8) / 2]]),
    edge([[cx, rows[1] + (bh + 8) / 2], [cx, rows[2] - bh / 2]], { label: '아니오' }),
    edge([[cx + bw / 2, rows[1]], [262, rows[1]]], { label: '예' }),
    edge([[cx, rows[2] + bh / 2], [cx, rows[3] - bh / 2]]),
    edge([[cx, rows[3] + bh / 2], [cx, rows[4] - (bh + 8) / 2]]),
    edge([[cx, rows[4] + (bh + 8) / 2], [cx, rows[5] - bh / 2]], { label: '예' }),
    edge([[cx + bw / 2, rows[4]], [262, rows[4]]], { label: '아니오' }),
    edge([[cx - bw / 2, rows[5]], [20, rows[5]], [20, rows[1]], [cx - bw / 2, rows[1]]], { dashed: true }),
  ];
  edges.forEach((e) => svg.append(e));
  boxes.forEach((b) => svg.append(b));

  let activeId = null;
  return {
    svg,
    setActive(boxId) {
      if (activeId === boxId) return;
      activeId = boxId;
      for (const b of svg.querySelectorAll('.flow-box')) b.classList.toggle('flow-box--active', b.dataset.box === boxId);
    },
  };
}

/** 재생기의 동작(action)을 순서도 도형 id로 옮긴다 */
export function boxForAction(action, structure) {
  if (structure === 'single') {
    switch (action) {
      case 'init': return 'start';
      case 'push': return 'evaluate';
      case 'pop': return 'choose';
      case 'make': return 'move';
      case 'goal': return 'success';
      case 'exhausted':
      case 'limit': return 'stuck';
      default: return null;
    }
  }
  switch (action) {
    case 'init': return 'start';
    case 'pop': return 'pop';
    case 'goal': return 'success';
    case 'make': return 'expand';
    case 'push':
    case 'skip': return 'push';
    case 'exhausted': return 'fail';
    case 'limit': return 'expand';
    default: return null;   // restart 등은 강조 없음
  }
}
