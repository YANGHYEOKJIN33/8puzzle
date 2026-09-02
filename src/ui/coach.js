/**
 * 예측 퀴즈 (요구사항 5.1.2) — 학습 1단계(의사코드 모드)에서만 나온다.
 *
 * "다음에 꺼낼 노드는?" 같은 예측을 던져, 학생이 자료구조의 성격(FIFO/LIFO)을
 * 스스로 떠올리게 한다. 예측은 강요하지 않는다 — 그냥 한 단계 눌러도 된다.
 *
 * 나타나는 순간: 다음 동작이 'pop'이고 OPEN에 노드가 2개 이상일 때.
 * 그때 "먼저 들어온 것(맨 앞)"과 "마지막에 들어온 것(맨 위/맨 뒤)" 중 무엇이
 * 꺼내질지 고르게 하고, 고르면 정답과 까닭을 보여 준다.
 */
import { el, fill } from './dom.js';
import { ALGORITHMS } from '../app/config.js';
import { findById } from '../app/state.js';

export function createCoach(store, player) {
  const root = el('div.coach', { hidden: true });
  let answeredAtIndex = -1;   // 이 프레임에서 이미 답했나
  let choice = null;          // 'first' | 'last'

  function draw() {
    const v = player.view();
    const inStage1 = store.get().stageId === 'pseudo';

    // 1단계가 아니거나, 다음이 pop이 아니거나, OPEN이 하나뿐이면 숨긴다
    if (v.empty || !inStage1 || v.nextAction !== 'pop' || v.openIds.length < 2) {
      root.hidden = true;
      return;
    }
    root.hidden = false;

    // 프레임이 바뀌면 답을 초기화
    if (answeredAtIndex !== v.index) { answeredAtIndex = -1; choice = null; }

    // 이 알고리즘이 실제로 꺼내는 쪽: 큐면 먼저 들어온 것(front=first), 스택이면 마지막(last)
    const structure = currentStructure();
    const correct = structure === 'stack' ? 'last' : 'first';

    if (answeredAtIndex !== v.index) {
      // 아직 안 골랐다 — 질문을 낸다
      fill(root,
        el('div.coach__q', {}, '🔮 예측: 다음에 꺼낼 노드는?'),
        el('div.coach__opts', {},
          el('button.coach__opt', { type: 'button', onclick: () => answer('first', correct, structure) },
            '먼저 들어온 것 (맨 앞)'),
          el('button.coach__opt', { type: 'button', onclick: () => answer('last', correct, structure) },
            '마지막에 들어온 것 (맨 위)'),
        ),
      );
    } else {
      // 골랐다 — 결과를 보여 준다
      const right = choice === correct;
      const why = structure === 'stack'
        ? '스택(LIFO)이므로 마지막에 넣은 것을 먼저 꺼냅니다.'
        : '큐(FIFO)이므로 먼저 들어온 것을 먼저 꺼냅니다.';
      fill(root,
        el(`div.coach__result${right ? '.coach__result--ok' : '.coach__result--no'}`, {},
          right ? '✓ 맞았어요!' : '✗ 다시 생각해 볼까요',
          el('span.coach__why', {}, why),
        ),
        el('button.coach__opt.coach__again', { type: 'button', onclick: () => { answeredAtIndex = -1; choice = null; draw(); } },
          '다시 고르기'),
      );
    }
  }

  function answer(picked, correct, structure) {
    choice = picked;
    answeredAtIndex = player.view().index;
    draw();
  }

  function currentStructure() {
    return findById(ALGORITHMS, store.get().algorithmId).structure;
  }

  store.subscribe(draw);
  player.subscribe(draw);
  return root;
}
