/**
 * 자료구조 패널 (요구사항 4.1 ③ · 4.2) — 시각화의 핵심.
 *
 * 재생기의 현재 장면(view)을 받아 OPEN을 알고리즘에 맞는 모양으로 그린다.
 *   큐(BFS)   : 가로 띠 — 앞에서 나가고 뒤로 들어온다
 *   스택(DFS) : 세로 더미 — 위에서 넣고 위에서 뺀다
 * 방금 넣은 항목은 초록으로 강조하고(요구사항 4.2.2), 카운터 4종을 항상 보여 준다.
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
  function openItem(nodes, id, { pushed = false, evalTag = 'depth' } = {}) {
    const node = nodes[id];
    const tag = evalTag === 'f' ? `f=${node.f}`
      : evalTag === 'h' ? `h=${node.h}`
      : `g=${node.depth}`;
    return el(`div.open-item${pushed ? '.open-item--pushed' : ''}`, {
      title: `깊이 ${node.depth} · g=${node.g}(지나온 비용) · h=${node.h}(남은 거리 어림값) · f=${node.f}`,
    },
      miniBoard(node.state, { moved: movedCell(nodes, node) }),
      el('span.open-item__tag', {}, tag),
    );
  }

  function renderOpen(viewData, structureKey, evalTag) {
    const { openIds, nodes, highlight, action } = viewData;
    if (openIds.length === 0) {
      return el('div.open-flow', {}, el('div.open-empty', {}, 'OPEN이 비었어요 (대기 목록 없음)'));
    }
    const flow = el('div.open-flow');

    // 큐든 스택이든 가로 띠로 그려 화면 높이에 잘리지 않게 한다.
    // 언제나 '다음에 나갈 것'이 왼쪽에 오도록 정렬한다.
    //   큐(FIFO): 맨 앞이 다음 → 그대로
    //   스택(LIFO): 맨 위(마지막에 넣은 것)가 다음 → 뒤집어서 마지막을 왼쪽에
    const display = structureKey === 'stack' ? [...openIds].reverse() : openIds;

    // 방금 넣은 항목만 초록으로 (pop/skip 장면에서는 강조 없음)
    const pushedId = action === 'push' || action === 'init' ? highlight : null;
    const render = (id) => flow.append(openItem(nodes, id, { pushed: id === pushedId, evalTag }));

    if (display.length <= HEAD + TAIL + 1) {
      display.forEach(render);
    } else {
      display.slice(0, HEAD).forEach(render);
      flow.append(el('span.open-ellipsis', {}, `… ${display.length - HEAD - TAIL}개 더 …`));
      display.slice(-TAIL).forEach(render);
    }
    return flow;
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

    const endLabel = endLabelFor(algo.structure, algo.evalTag);
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
          algo.structure === 'single' ? null
            : el('span.closed-chip', { title: '이미 확장을 마쳐 다시 보지 않는 노드' },
                `CLOSED ${viewData.closedSize}개`),
        ),
        el('div.open-wrap', {}, renderOpen(viewData, algo.structure, algo.evalTag), endLabel),
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

/** 구조에 맞는 양 끝 안내 문구 */
function endLabelFor(structure, evalTag) {
  const evalName = evalTag === 'f' ? 'f' : evalTag === 'h' ? 'h' : '평가값';
  if (structure === 'stack') {
    return el('div.open-end-label', {}, el('span', {}, '← 맨 위 = 다음에 나감'), el('span', {}, '먼저 들어온 것 →'));
  }
  if (structure === 'priority') {
    return el('div.open-end-label', {}, el('span', {}, `← ${evalName} 작음 = 다음에 나감`), el('span', {}, `${evalName} 큼 →`));
  }
  if (structure === 'single') {
    return el('div.open-end-label', {}, el('span', {}, '이 중 h가 가장 작은 이웃으로 옮깁니다'), el('span', {}, ''));
  }
  return el('div.open-end-label', {}, el('span', {}, '← 다음에 나감'), el('span', {}, '나중에 들어옴 →'));
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
