/**
 * 알고리즘 비교 모달 (요구사항 3.2.3).
 * 지금 고른 초기 상태(와 휴리스틱)로 여러 알고리즘을 돌려 성능을 나란히 보여 준다.
 * 무거운 계산이 화면을 멈추지 않도록 한 알고리즘씩 나눠 실행한다(요구사항 7.3.3).
 */
import { el, fill } from './dom.js';
import { COMPARABLE, summarizeRun, bestOf } from '../app/compare.js';
import { PRESETS, HEURISTICS, ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';

const yield0 = () => new Promise((r) => setTimeout(r, 0));

export function createComparePanel(store, player) {
  const tbody = el('tbody');
  const caption = el('p.compare__caption');
  const dialog = el('div.compare__dialog', { role: 'dialog', 'aria-modal': 'true', 'aria-label': '알고리즘 비교' });
  const backdrop = el('div.compare__backdrop', { hidden: true });
  let running = false;
  let lastFocus = null;

  const closeBtn = el('button.pill', { type: 'button', onclick: close }, '닫기 ✕');

  fill(dialog,
    el('div.compare__head', {},
      el('span.panel__title', {}, '알고리즘 비교'),
      closeBtn,
    ),
    caption,
    el('div.compare__scroll', {},
      el('table.compare__table', {},
        el('thead', {},
          el('tr', {},
            el('th', {}, '알고리즘'),
            el('th', {}, '결과'),
            el('th', {}, '해 길이'),
            el('th', {}, '확장한 노드'),
            el('th', {}, 'OPEN 최대'),
            el('th', {}, '단계'),
          ),
        ),
        tbody,
      ),
    ),
    el('p.compare__note', {},
      '해 길이·확장한 노드·OPEN 최대에서 ',
      el('span.compare__best-key', {}, '가장 좋은 값'),
      '을 초록으로 표시합니다. 행을 누르면 그 알고리즘으로 화면을 바꿉니다.'),
    propsSection(),
  );
  backdrop.append(dialog);
  document.body.append(backdrop);

  // 바깥(어두운 배경) 클릭·Esc로 닫기
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => { if (!backdrop.hidden && e.key === 'Escape') close(); });

  function close() {
    backdrop.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  async function open() {
    if (running) return;
    lastFocus = document.activeElement;
    const state = store.get();
    const preset = findById(PRESETS, state.presetId);
    const heuristic = findById(HEURISTICS, state.heuristicId);
    caption.textContent = `초기 상태: ${preset.name}(${preset.note}) · 경험적 탐색 휴리스틱: ${heuristic.name}`;
    backdrop.hidden = false;
    closeBtn.focus();

    // 행을 먼저 "계산 중"으로 깔아 둔다
    const rowEls = new Map();
    fill(tbody, COMPARABLE.map((id) => {
      const tr = el('tr', { 'data-id': id });
      rowEls.set(id, tr);
      fill(tr, el('td', {}, '…'), el('td', { colspan: '5' }, '계산 중…'));
      return tr;
    }));

    running = true;
    const rows = [];
    for (const id of COMPARABLE) {
      await yield0();                       // 한 개 돌리기 전에 화면이 숨 쉬게 한다
      const row = summarizeRun(id, preset.state, { heuristicId: state.heuristicId });
      rows.push(row);
      fillRow(rowEls.get(id), row);
    }
    running = false;

    // 모든 결과가 모이면 열별 최고값을 초록으로
    const best = bestOf(rows);
    for (const row of rows) {
      const tr = rowEls.get(row.id);
      markBest(tr, 'moves', row.moves, best.moves);
      markBest(tr, 'expanded', row.expanded, best.expanded);
      markBest(tr, 'maxOpen', row.maxOpen, best.maxOpen);
    }
  }

  function fillRow(tr, row) {
    const result = row.found
      ? el('span.compare__ok', {}, '해 찾음')
      : el('span.compare__fail', {}, row.reason === 'local-optimum' ? '지역 최적' : row.reason === 'depth-limit' ? '깊이 한계' : '못 찾음');
    fill(tr,
      el('td', {}, row.name),
      el('td', {}, result),
      el('td.col-moves', {}, row.found ? `${row.moves}수` : '–'),
      el('td.col-expanded', {}, String(row.expanded)),
      el('td.col-maxOpen', {}, String(row.maxOpen)),
      el('td', {}, String(row.frames)),
    );
    // 행을 누르면 그 알고리즘으로 화면 전환
    tr.classList.add('compare__row');
    tr.onclick = () => { store.set({ algorithmId: row.id, stageId: 'pseudo' }); close(); };
  }

  /**
   * 교과서 성질표 — 위의 표는 "이번 문제에서 잰 값", 이 표는 "언제나 성립하는 성질".
   * 둘을 나란히 두어야 학생이 측정값과 이론을 구분할 수 있다.
   */
  function propsSection() {
    return el('details.compare__props', { open: false },
      el('summary', {}, '📐 교과서 성질 — 완전성 · 최적성 · 시간 · 공간'),
      el('div.compare__scroll', {},
        el('table.compare__table', {},
          el('thead', {}, el('tr', {},
            el('th', {}, '알고리즘'),
            el('th', {}, '완전성'),
            el('th', {}, '최적성'),
            el('th', {}, '시간'),
            el('th', {}, '공간'))),
          el('tbody', {}, ALGORITHMS.filter((a) => a.props).map((a) => el('tr', {},
            el('td', {}, a.name),
            el('td', {}, a.props.complete),
            el('td', {}, a.props.optimal),
            el('td.compare__big', {}, a.props.time),
            el('td.compare__big', {}, a.props.space)))),
        )),
      el('p.compare__note', {},
        'b = 분기 계수(한 노드의 자식 수) · d = 해가 있는 깊이 · m = 트리의 최대 깊이 · L = 정해 둔 깊이 한계. ',
        '"완전성"은 해가 있으면 반드시 찾는가, "최적성"은 찾은 해가 가장 짧은가를 뜻해요.'),
    );
  }

  function markBest(tr, key, value, best) {
    if (best === null || value !== best) return;
    const cellClass = { moves: '.col-moves', expanded: '.col-expanded', maxOpen: '.col-maxOpen' }[key];
    const cell = tr.querySelector(cellClass);
    if (cell) cell.classList.add('compare__cell--best');
  }

  return { open };
}
