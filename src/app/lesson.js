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
export const LESSON = [
  {
    id: 'intro',
    title: '이 퍼즐이 뭐예요?',
    goal: '숫자 칸을 밀어서 오른쪽 "목표" 모양과 똑같이 만들면 끝나요.',
    todo: '왼쪽이 지금 모양, 오른쪽이 목표예요. 두 모양을 비교해 보세요.',
    layout: 'board',
    stage: 'pseudo',
    show: { board: true },
  },
  {
    id: 'step',
    title: '컴퓨터는 하나씩 살펴봐요',
    goal: '컴퓨터는 여러 모양을 하나씩 만들어 보면서 목표를 찾아요.',
    todo: '아래 ⏭ 한 단계 버튼을 여러 번 눌러 보세요. 위쪽 그림이 무슨 일인지 알려 줘요.',
    layout: 'board',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true },
  },
  {
    id: 'open',
    title: '대기 목록이 뭐예요?',
    goal: '아직 안 본 모양들을 줄 세워 둔 곳이 "대기 목록"이에요.',
    todo: '한 단계씩 누르면서, 줄이 늘어나고 줄어드는 걸 보세요.',
    layout: 'board-data',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, open: true },
  },
  {
    id: 'swap',
    title: '줄 세우는 방법을 바꿔 봐요',
    goal: '줄 세우는 방법을 바꾸면, 찾아가는 순서가 완전히 달라져요.',
    todo: '"대기 목록 =" 옆 단추를 눌러 바꿔 보고, 찾는 순서가 어떻게 달라지는지 보세요.',
    layout: 'board-data',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, open: true, picker: true },
  },
  {
    id: 'tree',
    title: '지나온 길을 나무로 봐요',
    goal: '살펴본 모양들이 나뭇가지처럼 뻗어 나가요.',
    todo: '가지가 어떻게 늘어나는지 보세요. 답을 찾으면 그 길이 주황색이 돼요.',
    layout: 'board-data',
    stage: 'pseudo',
    show: { board: true, action: true, controls: true, tree: true },
  },
  {
    id: 'code',
    title: '순서도와 코드로 봐요',
    goal: '지금 하는 일이 순서도와 코드의 어디인지 함께 보면 이해가 쉬워요.',
    todo: '한 단계씩 누르면서, 순서도의 도형과 코드의 줄이 같이 켜지는 걸 보세요.',
    layout: 'code',
    stage: 'pseudo',
    show: { action: true, controls: true, code: true },
  },
  {
    id: 'fill',
    title: '빈칸을 채워 봐요',
    goal: '코드에서 딱 한 곳만 바꿔도 컴퓨터가 다르게 찾아요.',
    todo: '빈칸을 골라 "이 코드로 실행"을 눌러 보세요. 결과가 어떻게 달라지나요?',
    layout: 'code-board',
    stage: 'fill',
    show: { board: true, code: true },
  },
  {
    id: 'write',
    title: '직접 만들어 봐요',
    goal: '이제 내가 직접 찾는 방법을 파이썬으로 적어 봐요.',
    todo: '코드를 고치고 "내 코드 실행"을 누르면, 내가 찾은 길이 왼쪽에서 움직여요.',
    layout: 'code-board',
    stage: 'write',
    show: { board: true, code: true },
  },
];

export function lessonAt(index) {
  const i = Math.max(0, Math.min(LESSON.length - 1, index | 0));
  return LESSON[i];
}
