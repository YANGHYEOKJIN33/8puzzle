/**
 * 인라인 용어 풍선 (요청 #3.2 · #3.4) — 화면 곳곳의 어려운 용어 옆에 작은 ⓘ 단추를 두고,
 * 누르면 그 자리에서 "쉬운 말 한 문장" 풍선이 뜬다. 학생이 페이지를 떠나 용어 사전을
 * 뒤지지 않아도 되고, 긴 설명을 본문에서 빼내 한 페이지의 정보량을 줄일 수 있다.
 *
 * 뜻풀이는 이미 있는 용어 사전(glossary.js)을 그대로 쓴다 — 한 곳에서 관리한다.
 */
import { el } from './dom.js';
import { glossaryEntries } from '../app/glossary.js';

const BY_TERM = new Map(glossaryEntries().map((e) => [e.term, e]));

let pop = null;
function closePop() {
  if (!pop) return;
  pop.remove();
  pop = null;
  document.removeEventListener('click', onDoc, true);
  document.removeEventListener('keydown', onKey, true);
  window.removeEventListener('resize', closePop);
  window.removeEventListener('scroll', closePop, true);
}
function onDoc(e) {
  if (pop && !pop.contains(e.target) && !e.target.closest('.infotip')) closePop();
}
function onKey(e) { if (e.key === 'Escape') closePop(); }

function openPop(anchor, entry) {
  const wasOpen = pop && pop.dataset.term === entry.term;
  closePop();
  if (wasOpen) return;   // 같은 단추를 다시 누르면 닫기(토글)

  pop = el('div.infopop', { role: 'dialog', 'aria-label': `${entry.term} 뜻` },
    el('div.infopop__term', {}, entry.term,
      entry.en ? el('span.infopop__en', {}, ` · ${entry.en}`) : null),
    el('div.infopop__plain', {}, entry.plain),
    entry.where ? el('div.infopop__where', {}, `📍 ${entry.where}에서 만나요`) : null,
  );
  pop.dataset.term = entry.term;
  document.body.append(pop);

  // 단추 근처에 두되 화면 밖으로 나가지 않게 물린다
  const r = anchor.getBoundingClientRect();
  const pr = pop.getBoundingClientRect();
  let left = r.left;
  let top = r.bottom + 6;
  if (left + pr.width > window.innerWidth - 8) left = window.innerWidth - pr.width - 8;
  if (left < 8) left = 8;
  if (top + pr.height > window.innerHeight - 8) top = r.top - pr.height - 6;
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(Math.max(8, top))}px`;

  // 이 클릭이 바로 바깥 클릭으로 잡히지 않도록 다음 틱에 감시 시작
  setTimeout(() => {
    document.addEventListener('click', onDoc, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', closePop);
    window.addEventListener('scroll', closePop, true);
  }, 0);
}

/**
 * 용어 + ⓘ 단추. 누르면 뜻 풍선이 뜬다.
 * @param {string} term  glossary.js의 term (예: 'OPEN 리스트')
 * @param {object} opts  label: 화면 표기(기본은 term), strong: 굵게
 */
export function infoTerm(term, { label = null, strong = false } = {}) {
  const entry = BY_TERM.get(term);
  const text = label ?? term;
  if (!entry) return el('span', {}, strong ? el('strong', {}, text) : text);
  const btn = el('button.infotip', {
    type: 'button', 'aria-label': `${term} 뜻 보기`, title: `${term} — 뜻 보기`,
    onclick: (e) => { e.stopPropagation(); openPop(btn, entry); },
  },
    strong ? el('strong', {}, text) : el('span', {}, text),
    el('span.infotip__i', { 'aria-hidden': 'true' }, 'ⓘ'),
  );
  return btn;
}
