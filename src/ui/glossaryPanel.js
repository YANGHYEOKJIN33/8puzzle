/**
 * 용어 사전 모달 — 화면에서 쓰는 정확한 용어의 뜻을 언제든 찾아본다.
 * (수업 중 "이 말이 무슨 뜻이에요?"를 바로 해결하기 위한 화면)
 */
import { el, fill } from './dom.js';
import { searchGlossary } from '../app/glossary.js';

export function createGlossaryPanel() {
  const list = el('div.gloss__list');
  const count = el('span.panel__hint');
  const input = el('input.gloss__search', {
    type: 'search', placeholder: '용어 찾기 (예: OPEN, 휴리스틱, 스택)',
    'aria-label': '용어 찾기',
    oninput: () => render(input.value),
  });

  const dialog = el('div.compare__dialog.gloss__dialog', {
    role: 'dialog', 'aria-modal': 'true', 'aria-label': '용어 사전',
  });
  const backdrop = el('div.compare__backdrop', { hidden: true });
  let lastFocus = null;

  function render(query = '') {
    const groups = searchGlossary(query);
    const shown = groups.reduce((n, g) => n + g.items.length, 0);
    count.textContent = `${shown}개`;
    if (groups.length === 0) {
      fill(list, el('div.placeholder', {}, el('strong', {}, '찾는 용어가 없어요'), '다른 낱말로 찾아보세요.'));
      return;
    }
    fill(list, groups.map((g) => el('section.gloss__group', {},
      el('h3.gloss__group-title', {}, g.group),
      el('dl.gloss__items', {}, g.items.flatMap((it) => [
        el('dt.gloss__term', {},
          el('strong', {}, it.term),
          el('span.gloss__en', {}, it.en)),
        el('dd.gloss__def', {},
          it.plain,
          el('span.gloss__where', {}, `📍 ${it.where}`)),
      ])),
    )));
  }

  fill(dialog,
    el('div.compare__head', {},
      el('span.panel__title', {}, '📖 용어 사전'),
      count,
      el('span.topbar__spacer'),
      el('button.pill', { type: 'button', onclick: close }, '닫기 ✕'),
    ),
    el('div.gloss__searchbar', {}, input),
    el('div.compare__scroll', {}, list),
    el('p.compare__note', {},
      '화면에는 교과서와 같은 정확한 용어를 씁니다. 뜻이 막히면 여기서 찾아보세요.'),
  );
  backdrop.append(dialog);
  document.body.append(backdrop);

  function close() {
    backdrop.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  function open() {
    lastFocus = document.activeElement;
    input.value = '';
    render('');
    backdrop.hidden = false;
    input.focus();
  }

  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => { if (!backdrop.hidden && e.key === 'Escape') close(); });

  return { open, close };
}
