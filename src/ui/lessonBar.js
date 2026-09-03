/**
 * 레슨 진행 막대 — 지금 몇 번째 쪽인지, 이번에 무엇을 배우는지, 무엇을 하면 되는지
 * 를 한 줄씩 보여 주고 앞뒤로 넘긴다. (학습 목표를 학생이 분명히 알게 하기 위함)
 *
 * 탐색 탭과 자료구조 탭이 이 막대를 함께 쓴다. 어떤 쪽 묶음을 보여 줄지는
 * lesson.js의 currentLesson(state)이 정한다.
 */
import { el, fill } from './dom.js';
import { currentLesson } from '../app/lesson.js';

export function mountLessonBar(root, store) {
  const dots = el('div.lesson__dots', { role: 'tablist', 'aria-label': '학습 순서' });
  const count = el('span.lesson__count');
  const title = el('h2.lesson__title');
  const goal = el('p.lesson__goal');
  const todo = el('p.lesson__todo');

  const go = (delta) => {
    const { index, key } = currentLesson(store.get());
    store.set({ [key]: index + delta });
  };
  const prev = el('button.pill.lesson__nav', { type: 'button', onclick: () => go(-1) }, '← 이전');
  const next = el('button.pill.ctrl--primary.lesson__nav', { type: 'button', onclick: () => go(1) }, '다음 →');

  fill(root,
    el('div.lesson__top', {}, dots, count),
    el('div.lesson__text', {}, title, goal, todo),
    el('div.lesson__navs', {}, prev, next),
  );

  // 탭이 바뀌면 쪽 묶음이 통째로 달라지므로 동그라미를 다시 만든다
  let builtFor = null;
  let dotButtons = [];

  store.subscribe((state) => {
    const { steps, index, key } = currentLesson(state);

    if (builtFor !== steps) {
      builtFor = steps;
      dotButtons = steps.map((step, i) =>
        el('button.lesson__dot', {
          type: 'button', role: 'tab', title: `${i + 1}. ${step.title}`,
          'aria-label': `${i + 1}쪽: ${step.title}`,
          onclick: () => store.set({ [key]: i }),
        }, String(i + 1)));
      fill(dots, dotButtons);
    }

    const step = steps[index];
    title.textContent = `${index + 1}. ${step.title}`;
    goal.textContent = `📘 배울 것 — ${step.goal}`;
    todo.textContent = `✋ 해 볼 것 — ${step.todo}`;
    count.textContent = `${index + 1} / ${steps.length}`;
    prev.disabled = index === 0;
    next.disabled = index === steps.length - 1;
    next.textContent = index === steps.length - 1 ? '끝!' : '다음 →';
    dotButtons.forEach((d, k) => {
      d.setAttribute('aria-selected', String(k === index));
      d.classList.toggle('lesson__dot--done', k < index);
    });
  });
}
