/**
 * 첫 방문 안내 (요구사항 6.1.6) — 문서 대신 3단계 말풍선으로 사용법을 알려 준다.
 * 학습자가 화면 구성을 빠르게 이해하도록 돕는 것이 목적이다.
 */
import { el, fill } from './dom.js';

const SEEN_KEY = 'puzzle8-lab:seen-guide';

const STEPS = [
  {
    emoji: '📦',
    title: '여기는 “자료구조” 화면이에요',
    body: '맨 위에 큰 탭이 넷 있어요(📦 자료구조 · 🧩 탐색 기초 · 🌿 알고리즘 · ✅ 정리·확인). ' +
          '지금은 📦 자료구조 — 넣기·꺼내기를 직접 눌러 “무엇이 먼저 나오는가” 규칙 하나만 익히면 돼요. ' +
          '왼쪽은 넣은 순서, 가운데가 구조, 오른쪽은 나온 순서입니다.',
  },
  {
    emoji: '🌿',
    title: '탭을 왼쪽부터 오른쪽으로',
    body: '📦 자료구조 → 🧩 탐색 기초 → 🌿 알고리즘 → ✅ 정리·확인 순서로 배웁니다. ' +
          '🌿 알고리즘 탭에는 하위 탭(너비·깊이·최상우선·A*·언덕등반)이 있어, 알고리즘마다 ' +
          '동작 → 의사코드 → 줄별 이미지 → 파이썬을 하나씩 깊게 봐요.',
  },
  {
    emoji: '👣',
    title: '쪽마다 하나씩, 한 걸음씩',
    body: '쪽마다 📘 배울 것과 ✋ 해 볼 것이 적혀 있어요. 아래 ⏭ 한 단계 로 천천히, ' +
          '▶ 재생 으로 자동으로 진행하고, ⏮ 뒤로 로 방금 장면을 다시 볼 수 있어요. (키보드 → ← 도 됩니다)',
  },
];

export function createOnboarding(store) {
  const card = el('div.guide__card', { role: 'dialog', 'aria-modal': 'true', 'aria-label': '사용 안내' });
  const backdrop = el('div.guide__backdrop', { hidden: true }, card);
  document.body.append(backdrop);

  let step = 0;

  function render() {
    const s = STEPS[step];
    fill(card,
      el('div.guide__dots', {}, STEPS.map((_, i) => el(`span.guide__dot${i === step ? '.guide__dot--on' : ''}`))),
      el('div.guide__emoji', {}, s.emoji),
      el('h2.guide__title', {}, s.title),
      el('p.guide__body', {}, s.body),
      el('div.guide__actions', {},
        el('button.pill', { type: 'button', onclick: close }, '건너뛰기'),
        el('span.topbar__spacer'),
        step > 0 ? el('button.pill', { type: 'button', onclick: () => { step -= 1; render(); } }, '이전') : null,
        el('button.pill.ctrl--primary', { type: 'button', onclick: next },
          step === STEPS.length - 1 ? '시작하기' : '다음'),
      ),
    );
  }

  function next() { if (step === STEPS.length - 1) close(); else { step += 1; render(); } }

  function close() {
    backdrop.hidden = true;
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* 무시 */ }
  }

  function open() { step = 0; render(); backdrop.hidden = false; card.querySelector('.ctrl--primary')?.focus(); }

  document.addEventListener('keydown', (e) => { if (!backdrop.hidden && e.key === 'Escape') close(); });

  function maybeShow() {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { seen = false; }
    if (!seen) open();
  }

  return { open, maybeShow };
}
