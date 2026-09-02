/**
 * 첫 방문 안내 (요구사항 6.1.6) — 문서 대신 3단계 말풍선으로 사용법을 알려 준다.
 * 학습자가 화면 구성을 빠르게 이해하도록 돕는 것이 목적이다.
 */
import { el, fill } from './dom.js';

const SEEN_KEY = 'puzzle8-lab:seen-guide';

const STEPS = [
  {
    emoji: '①',
    title: '무엇을 배울지 고르세요',
    body: '맨 위에서 알고리즘(너비 우선·A* 등)을, 그 아래에서 학습 단계(의사코드 → 빈칸 채우기 → 직접 작성)를 고릅니다. 처음이라면 그대로 두어도 좋아요.',
  },
  {
    emoji: '②',
    title: '한 걸음씩 실행해 보세요',
    body: '아래 ⏭ 한 단계 로 천천히, ▶ 재생 으로 자동으로 진행합니다. ⏮ 뒤로 로 방금 장면을 다시 볼 수 있어요. (키보드 → ← 도 됩니다)',
  },
  {
    emoji: '③',
    title: '자료구조가 변하는 걸 관찰하세요',
    body: '코드가 한 줄 실행될 때마다 오른쪽 OPEN(다음에 살펴볼 대기 목록)이 어떻게 늘고 주는지 보세요. 큐·스택·우선순위 큐의 차이를 눈으로 아는 것이 이 사이트의 핵심입니다.',
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
