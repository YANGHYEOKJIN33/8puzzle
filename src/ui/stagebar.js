/**
 * 학습 단계 선택 막대 (요구사항 5장).
 * 세 단계는 잠금 없이 오갈 수 있고, 단계를 바꿔도 알고리즘·초기 상태는 유지된다 (요구사항 5.4).
 */
import { el, fill } from './dom.js';
import { STAGES } from '../app/config.js';

export function mountStagebar(root, store) {
  const buttons = STAGES.map((stage) =>
    el('button.pill.stagechip', {
      type: 'button',
      'data-stage': stage.id,
      onclick: () => store.set({ stageId: stage.id }),
    },
      el('span.stagechip__no', {}, String(stage.no)),
      el('span', {}, stage.name),
      el('span.stagechip__desc', {}, stage.desc),
    ),
  );

  fill(root,
    el('span.panel__title', {}, '학습 단계'),
    ...buttons,
  );

  store.subscribe((state) => {
    for (const button of buttons) {
      const selected = button.dataset.stage === state.stageId;
      button.setAttribute('aria-pressed', String(selected));
    }
  });
}
