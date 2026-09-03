/**
 * 레슨 진행 막대 — 지금 몇 번째 페이지인지, 이번에 무엇을 배우는지, 무엇을 하면 되는지
 * 를 한 줄씩 보여 주고 앞뒤로 넘긴다. (학습 목표를 학생이 분명히 알게 하기 위함)
 */
import { el, fill } from './dom.js';
import { LESSON, lessonAt } from '../app/lesson.js';

export function mountLessonBar(root, store) {
  const dots = el('div.lesson__dots', { role: 'tablist', 'aria-label': '학습 순서' });
  const title = el('h2.lesson__title');
  const goal = el('p.lesson__goal');
  const todo = el('p.lesson__todo');

  const prev = el('button.pill.lesson__nav', { type: 'button',
    onclick: () => store.set({ lessonStep: store.get().lessonStep - 1 }) }, '← 이전');
  const next = el('button.pill.ctrl--primary.lesson__nav', { type: 'button',
    onclick: () => store.set({ lessonStep: store.get().lessonStep + 1 }) }, '다음 →');

  const dotButtons = LESSON.map((step, i) =>
    el('button.lesson__dot', {
      type: 'button', role: 'tab', title: `${i + 1}. ${step.title}`,
      'aria-label': `${i + 1}단계: ${step.title}`,
      onclick: () => store.set({ lessonStep: i }),
    }, String(i + 1)));
  fill(dots, dotButtons);

  fill(root,
    el('div.lesson__top', {}, dots,
      el('span.lesson__count'),
    ),
    el('div.lesson__text', {}, title, goal, todo),
    el('div.lesson__navs', {}, prev, next),
  );
  const count = root.querySelector('.lesson__count');

  store.subscribe((state) => {
    const i = state.lessonStep;
    const step = lessonAt(i);
    title.textContent = `${i + 1}. ${step.title}`;
    goal.textContent = `📘 배울 것 — ${step.goal}`;
    todo.textContent = `✋ 해 볼 것 — ${step.todo}`;
    count.textContent = `${i + 1} / ${LESSON.length}`;
    prev.disabled = i === 0;
    next.disabled = i === LESSON.length - 1;
    next.textContent = i === LESSON.length - 1 ? '끝!' : '다음 →';
    dotButtons.forEach((d, k) => {
      d.setAttribute('aria-selected', String(k === i));
      d.classList.toggle('lesson__dot--done', k < i);
    });
  });
}
