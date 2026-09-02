/**
 * 자료구조 패널 (요구사항 4.1 ③④ · 4.2).
 * 고른 알고리즘에 따라 OPEN을 어떤 모양으로 그릴지 알려 주고,
 * 카운터 4종은 스크롤과 무관하게 패널 아래에 고정해 항상 보이게 한다 (요구사항 4.2.5).
 */
import { el, fill } from './dom.js';
import { ALGORITHMS, STRUCTURE_LABEL } from '../app/config.js';
import { findById } from '../app/state.js';

const COUNTERS = [
  { id: 'generated', label: '생성한 노드' },
  { id: 'expanded',  label: '펼친 노드' },
  { id: 'maxOpen',   label: 'OPEN 최대' },
  { id: 'depth',     label: '현재 깊이' },
];

export function mountDataPanel(root, store) {
  const body = el('div.panel__body');

  const foot = el('div.panel__foot', {},
    el('div.counters', {},
      COUNTERS.map((counter) =>
        el('div.counter', {},
          el('span.counter__label', {}, counter.label),
          el('span.counter__value', { id: `counter-${counter.id}` }, '–'),
        ),
      ),
    ),
  );

  fill(root,
    el('div.panel__head', {},
      el('span.panel__title', {}, '자료구조'),
      el('span.panel__hint', {}, 'OPEN · CLOSED · 탐색 트리'),
    ),
    body,
    foot,
  );

  store.subscribe((state) => {
    const algo = findById(ALGORITHMS, state.algorithmId);
    const structure = STRUCTURE_LABEL[algo.structure];

    fill(body,
      // 요구사항 6.1.5: 색과 함께 이름표를 붙여 색만으로 구분하지 않게 한다
      el('div.ds-legend', {},
        el('span', {}, el('i.swatch.swatch--current'), '현재 노드'),
        el('span', {}, el('i.swatch.swatch--open'), 'OPEN 삽입'),
        el('span', {}, el('i.swatch.swatch--closed'), 'CLOSED'),
        el('span', {}, el('i.swatch.swatch--path'), '해 경로'),
      ),

      el('div.field', {},
        el('span', {}, 'OPEN을 다루는 방식'),
        el('strong', {}, structure.name),
      ),
      el('p.panel__hint', { style: 'margin:4px 0 12px' }, structure.hint),

      el('div.placeholder', {},
        el('strong', {}, 'OPEN / CLOSED 시각화 준비 중'),
        '탐색을 실행하면 이 자리에 ',
        structure.name,
        ' 모양으로 노드가 들어오고 나가는 모습이 나타납니다. (개발 5단계)',
      ),
    );
  });
}
