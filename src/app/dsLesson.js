/**
 * "자료구조 배우기" 탭의 쪽 구성.
 *
 * 이 학생들은 스택·큐를 배운 적이 없습니다. 그래서 탐색 알고리즘보다 먼저
 * "무엇을 먼저 꺼내는가" 규칙 하나만 손으로 넣고 꺼내 보며 익히게 합니다.
 * 마지막 쪽에서 "이 자료구조가 곧 그 탐색 알고리즘"이라는 것으로 이어 줍니다.
 *
 * 탐색 레슨(lesson.js)과 같은 모양(제목·📘 배울 것·✋ 해 볼 것)이라
 * 같은 진행 막대를 그대로 씁니다.
 */

export const DS_LESSON = [
  {
    id: 'ds-queue',
    kind: 'queue',
    view: 'play',
    title: '큐 — 줄 서기',
    goal: '먼저 들어온 것이 먼저 나가는 상자를 "큐"라고 불러요.',
    todo: '넣기를 여러 번 누른 뒤 꺼내기를 눌러 보세요. 누가 먼저 나오나요?',
  },
  {
    id: 'ds-stack',
    kind: 'stack',
    view: 'play',
    title: '스택 — 접시 쌓기',
    goal: '마지막에 들어온 것이 먼저 나가는 상자를 "스택"이라고 불러요.',
    todo: '똑같이 넣고 꺼내 보세요. 큐와 나오는 순서가 어떻게 다른가요?',
  },
  {
    id: 'ds-priority',
    kind: 'priority',
    view: 'play',
    title: '우선순위 큐 — 급한 것부터',
    goal: '온 순서가 아니라 급한 정도로 순서를 정하는 상자예요. 번호가 작을수록 급해요.',
    todo: '넣기를 눌러 보세요. 나중에 넣은 것이 앞으로 끼어드는 걸 볼 수 있어요.',
  },
  {
    id: 'ds-compare',
    kind: 'queue',
    view: 'compare',
    title: '셋을 나란히 견줘 봐요',
    goal: '똑같은 것을 똑같은 순서로 넣어도, 상자가 다르면 나오는 순서가 달라져요.',
    todo: '넣기를 눌러 셋에 같이 넣고, 꺼내기를 눌러 나오는 순서를 비교해 보세요.',
  },
  {
    id: 'ds-bridge',
    kind: 'queue',
    view: 'bridge',
    title: '자료구조가 곧 탐색 방법이에요',
    goal: '8-퍼즐의 대기 목록을 어떤 상자로 두느냐가 탐색 방법을 정해요.',
    todo: '아래에서 하나를 골라 "이 탐색 보러 가기"를 눌러 보세요.',
  },
];

export function dsLessonAt(index) {
  const i = Math.max(0, Math.min(DS_LESSON.length - 1, index | 0));
  return DS_LESSON[i];
}
