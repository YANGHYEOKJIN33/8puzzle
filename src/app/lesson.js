/**
 * 레슨(단계별 페이지) — 한 화면에 딱 필요한 것만 보여 주고, 하나씩 넘어간다.
 *
 * 왜 이렇게 하나요?
 *   한 화면에 많은 것이 있으면 처음 배우는 학생은 어디를 봐야 할지 모릅니다.
 *   그래서 페이지를 나누고, 페이지마다 "이번에 배울 것" 한 가지만 둡니다.
 *
 * 말은 되도록 쉽게 씁니다(초등학생도 읽을 수 있게).
 *   노드 → 배치,  OPEN → 대기 목록,  확장 → 펼치기
 *
 * layout : 화면 배치 이름 (styles/layout.css의 .workspace[data-layout=...])
 * stage  : 코드 패널이 어떤 모드로 그려질지 (pseudo | fill | write)
 * show   : 이 페이지에서 보여 줄 조각들
 */
import { DS_LESSON } from './dsLesson.js';

export const LESSON = [
  {
    id: 'intro',
    title: '8-퍼즐과 상태(state)',
    goal: '숫자 칸을 밀어서 목표 상태와 똑같이 만들면 끝나요. 이런 배치 하나하나를 "상태(state)"라고 불러요.',
    todo: '타일을 눌러 직접 밀어 보세요! 빈칸 옆 타일만 움직여요. 이렇게 상태를 바꾸는 규칙이 "연산자"예요.',
    layout: 'board',
    stage: 'pseudo',
    show: { board: true, play: true },
  },
  {
    id: 'step',
    title: '노드를 하나씩 확장해요',
    goal: '상태 하나를 "노드(node)"라고 해요. 컴퓨터는 노드를 하나 꺼내(pop) 자식 노드를 만들며(확장) 목표를 찾아요.',
    todo: '위쪽 ⏭ 한 단계 버튼을 여러 번 눌러 보세요. 아래에 자식 노드가 만들어지는 것도 함께 보세요.',
    layout: 'board',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, children: true },
  },
  {
    id: 'open',
    title: 'OPEN 리스트와 CLOSED',
    goal: '아직 확장 안 한 노드는 OPEN 리스트에, 이미 확장을 마친 노드는 CLOSED에 둡니다.',
    todo: '한 단계씩 누르면서 OPEN이 늘고 주는 것, CLOSED가 쌓이는 것을 보세요.',
    layout: 'board-data',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, open: true, slim: true },
  },
  {
    id: 'compare',
    title: 'OPEN 자료구조를 바꿔 봐요',
    goal: 'OPEN을 큐로 두면 너비 우선 탐색, 스택이면 깊이 우선 탐색이 돼요. 자료구조 하나가 알고리즘을 정합니다.',
    todo: '"OPEN 자료구조 ="를 바꿔 보고, 위의 OPEN 리스트와 아래 탐색 트리가 어떻게 달라지는지 비교해 보세요.',
    layout: 'board-tree',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, open: true, tree: true, picker: true, slim: true },
  },
  {
    id: 'code',
    title: '순서도와 의사코드',
    goal: '알고리즘을 그림으로 적은 것이 순서도, 말과 코드 중간쯤으로 적은 것이 의사코드예요. 둘은 같은 절차를 가리켜요.',
    todo: '한 단계씩 누르면서, 순서도 도형·의사코드 줄·퍼즐 상태·OPEN 리스트가 한꺼번에 바뀌는 걸 보세요.',
    layout: 'code-board-data',
    stage: 'pseudo',
    show: { action: true, controls: true, code: true, board: true, open: true, slim: true },
  },
  {
    id: 'fill',
    title: '빈칸 채우기 — 코드 한 줄의 힘',
    goal: 'OPEN에서 꺼내는 자리(pop) 한 줄만 바꿔도 알고리즘이 통째로 달라져요.',
    todo: '빈칸을 골라 "이 코드로 실행"을 눌러 보세요. 확장 노드 수와 해의 길이가 어떻게 달라지나요?',
    layout: 'code-board',
    stage: 'fill',
    show: { board: true, code: true, controls: true, codemap: true },
  },
  {
    id: 'write',
    title: '파이썬으로 직접 작성',
    goal: '이제 탐색 알고리즘을 파이썬으로 직접 써 봐요. 브라우저 안에서 진짜 파이썬이 실행됩니다.',
    todo: '코드를 고치고 "내 코드 실행"을 누르면, 내가 찾은 해 경로가 퍼즐 판에서 재생돼요.',
    layout: 'code-board',
    stage: 'write',
    show: { board: true, code: true, controls: true },
  },
  {
    id: 'wrapup',
    title: '오늘 배운 것 정리',
    goal: '자료구조 하나를 고르는 일이 곧 탐색 알고리즘을 고르는 일이었어요.',
    todo: '아래 표로 배운 것을 되짚고, ⚖ 비교와 📖 용어로 한 번 더 확인해 보세요.',
    layout: 'code',
    stage: 'pseudo',
    show: { code: true, summary: true },
  },
];

export function lessonAt(index) {
  const i = Math.max(0, Math.min(LESSON.length - 1, index | 0));
  return LESSON[i];
}

/**
 * 지금 탭에서 쓸 쪽 묶음을 돌려준다.
 * 탐색 탭과 자료구조 탭이 같은 진행 막대를 함께 쓰기 위한 다리.
 */
export function currentLesson(state) {
  if (state.mode === 'ds') {
    return { steps: DS_LESSON, index: Math.max(0, Math.min(DS_LESSON.length - 1, state.dsStep | 0)), key: 'dsStep' };
  }
  return { steps: LESSON, index: Math.max(0, Math.min(LESSON.length - 1, state.lessonStep | 0)), key: 'lessonStep' };
}
