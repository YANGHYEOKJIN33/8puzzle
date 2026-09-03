/**
 * 용어 사전 — 화면에서 쓰는 "정확한 용어"와 "쉬운 말"을 짝지어 둔다.
 *
 * 왜 필요한가요?
 *   쉬운 말만 쓰면 교과서·시험지의 낱말과 이어지지 않고,
 *   용어만 쓰면 처음 배우는 학생이 막힙니다.
 *   그래서 화면에는 정확한 용어를 쓰고, 여기서 뜻을 언제든 찾아보게 합니다.
 *
 * term  : 교과서에서 쓰는 우리말 용어 (화면에도 이 말을 쓴다)
 * en    : 영어 용어
 * plain : 초등학생도 읽을 수 있는 한 문장
 * where : 사이트 어디에서 만나는지
 */
export const GLOSSARY = [
  {
    group: '문제와 상태',
    items: [
      { term: '상태', en: 'state', plain: '퍼즐 판의 배치 하나. 8-퍼즐이면 숫자 9개가 놓인 모양이에요.', where: '퍼즐 판' },
      { term: '초기 상태', en: 'initial state', plain: '탐색을 시작하는 배치.', where: '퍼즐 판 왼쪽' },
      { term: '목표 상태', en: 'goal state', plain: '만들어야 하는 배치. 1~8이 차례로 놓이고 빈칸이 오른쪽 아래.', where: '퍼즐 판 오른쪽' },
      { term: '연산자', en: 'operator', plain: '상태를 바꾸는 규칙. 여기서는 빈칸을 상·하·좌·우로 미는 것.', where: '순서도 · 의사코드' },
      { term: '해', en: 'solution', plain: '초기 상태에서 목표 상태까지 가는 길(연산자의 나열).', where: '동작 카드' },
    ],
  },
  {
    group: '탐색의 뼈대',
    items: [
      { term: '노드', en: 'node', plain: '탐색이 만든 상태 하나. 어디서 왔는지(부모)와 깊이를 함께 갖고 있어요.', where: '탐색 트리' },
      { term: '확장', en: 'expand', plain: '노드 하나에서 갈 수 있는 자식 노드들을 만드는 일.', where: '동작 카드 🌱' },
      { term: '생성 노드', en: 'generated', plain: '지금까지 만들어 본 노드의 개수.', where: '아래 카운터' },
      { term: '확장 노드', en: 'expanded', plain: '실제로 자식을 만들어 본 노드의 개수. 알고리즘이 얼마나 일했는지를 보여 줘요.', where: '아래 카운터' },
      { term: 'OPEN 리스트', en: 'open list · frontier', plain: '아직 확장하지 않고 기다리는 노드를 모아 둔 곳. "대기 목록".', where: '자료구조 패널' },
      { term: 'CLOSED', en: 'closed list', plain: '이미 확장을 마쳐 다시 보지 않는 노드를 모아 둔 곳.', where: '자료구조 패널' },
      { term: '탐색 트리', en: 'search tree', plain: '만든 노드들을 부모–자식으로 이어 그린 그림. 탐색이 어디로 뻗었는지 보여 줘요.', where: '자료구조 패널 아래' },
      { term: '깊이', en: 'depth', plain: '초기 상태에서 그 노드까지 몇 번 움직였는지.', where: '노드 꼬리표' },
      { term: '분기 계수', en: 'branching factor', plain: '노드 하나에서 자식이 평균 몇 개 생기는지. 8-퍼즐은 보통 2~4개예요.', where: '교사용 안내' },
    ],
  },
  {
    group: '자료구조',
    items: [
      { term: '자료구조', en: 'data structure', plain: '값을 담아 두고 꺼내는 규칙이 정해진 그릇.', where: '자료구조 탭' },
      { term: '큐', en: 'queue', plain: '먼저 넣은 것이 먼저 나오는 자료구조(FIFO). 매표소 줄과 같아요.', where: '자료구조 탭 1쪽' },
      { term: 'FIFO', en: 'First In, First Out', plain: '먼저 들어온 것이 먼저 나간다는 큐의 규칙.', where: '자료구조 탭 1쪽' },
      { term: '스택', en: 'stack', plain: '마지막에 넣은 것이 먼저 나오는 자료구조(LIFO). 접시 더미와 같아요.', where: '자료구조 탭 2쪽' },
      { term: 'LIFO', en: 'Last In, First Out', plain: '마지막에 들어온 것이 먼저 나간다는 스택의 규칙.', where: '자료구조 탭 2쪽' },
      { term: '우선순위 큐', en: 'priority queue', plain: '들어온 순서가 아니라 우선순위 값이 작은 것부터 나오는 자료구조.', where: '자료구조 탭 3쪽' },
      { term: '삽입', en: 'push · insert', plain: '자료구조에 값 하나를 넣는 일.', where: '넣기 단추' },
      { term: '삭제', en: 'pop', plain: '자료구조에서 규칙에 맞는 값 하나를 꺼내는 일.', where: '꺼내기 단추' },
    ],
  },
  {
    group: '알고리즘',
    items: [
      { term: '맹목적 탐색', en: 'uninformed search', plain: '목표가 어디쯤인지 힌트 없이 순서대로만 찾는 방법. BFS·DFS·DLS·IDS.', where: '찾는 방법 목록' },
      { term: '경험적 탐색', en: 'informed · heuristic search', plain: '"목표에 얼마나 가까운지" 어림값을 참고해 찾는 방법. 언덕 등반·최상 우선·A*.', where: '찾는 방법 목록' },
      { term: '너비 우선 탐색', en: 'BFS', plain: 'OPEN이 큐. 얕은 곳부터 골고루 봐서 최단 경로를 보장해요.', where: '찾는 방법' },
      { term: '깊이 우선 탐색', en: 'DFS', plain: 'OPEN이 스택. 한 갈래를 끝까지 파고들어요. 최단 경로는 보장하지 않아요.', where: '찾는 방법' },
      { term: '깊이 제한 탐색', en: 'DLS', plain: '깊이에 한계를 두어 끝없이 내려가지 않게 한 DFS.', where: '찾는 방법' },
      { term: '반복적 깊이 심화 탐색', en: 'IDS', plain: '깊이 한계를 1씩 늘리며 DLS를 반복. BFS의 최단성과 DFS의 적은 메모리를 함께 얻어요.', where: '찾는 방법' },
      { term: '언덕 등반', en: 'hill climbing', plain: 'OPEN 없이 지금보다 나은 이웃으로만 옮겨 가는 방법. 지역 최적에 갇힐 수 있어요.', where: '찾는 방법' },
      { term: '최상 우선 탐색', en: 'best-first search', plain: 'h(n)이 가장 작은 노드부터 확장. 빠르지만 최단 경로는 보장하지 않아요.', where: '찾는 방법' },
      { term: 'A* 알고리즘', en: 'A* search', plain: 'f(n) = g(n) + h(n)이 가장 작은 노드부터 확장. 조건을 갖추면 최단 경로를 보장해요.', where: '찾는 방법' },
    ],
  },
  {
    group: '평가 함수',
    items: [
      { term: '휴리스틱', en: 'heuristic', plain: '"목표까지 얼마나 남았을까"를 어림잡는 값. 정확하지 않아도 도움이 돼요.', where: 'h 꼬리표' },
      { term: 'g(n)', en: 'path cost', plain: '초기 상태에서 지금 노드까지 실제로 든 비용(= 움직인 횟수).', where: '노드 미리보기' },
      { term: 'h(n)', en: 'heuristic value', plain: '지금 노드에서 목표까지 남았을 것으로 어림잡은 값.', where: '노드 꼬리표' },
      { term: 'f(n)', en: 'evaluation function', plain: 'A*가 쓰는 값. f(n) = g(n) + h(n).', where: '노드 꼬리표' },
      { term: '맨해튼 거리', en: 'Manhattan distance', plain: '타일마다 제자리까지 가로·세로로 몇 칸인지 세어 모두 더한 값.', where: '기본 휴리스틱' },
      { term: '허용 가능', en: 'admissible', plain: '실제 남은 비용보다 절대 크게 잡지 않는 휴리스틱. A*의 최단성 조건이에요.', where: '빈칸 채우기' },
    ],
  },
  {
    group: '표현 방법',
    items: [
      { term: '순서도', en: 'flowchart', plain: '알고리즘의 절차를 도형과 화살표로 그린 그림.', where: '순서도 · 코드 패널' },
      { term: '의사코드', en: 'pseudocode', plain: '사람 말과 프로그램 코드의 중간쯤으로 적은 절차. 어떤 언어로도 옮길 수 있어요.', where: '순서도 · 코드 패널' },
      { term: '반복문', en: 'loop', plain: '조건이 참인 동안 같은 일을 되풀이하는 문장. while.', where: '의사코드 3줄' },
      { term: '조건문', en: 'if statement', plain: '조건이 맞을 때만 실행하는 문장. if.', where: '의사코드 5줄' },
    ],
  },
];

/** 검색용 — 한 줄짜리 평평한 목록으로 편다 */
export function glossaryEntries() {
  return GLOSSARY.flatMap((g) => g.items.map((it) => ({ ...it, group: g.group })));
}

/** 낱말로 찾기 (용어·영어·설명 어디에 있어도 걸린다) */
export function searchGlossary(query) {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY;
  return GLOSSARY
    .map((g) => ({
      group: g.group,
      items: g.items.filter((it) =>
        `${it.term} ${it.en} ${it.plain} ${it.where}`.toLowerCase().includes(q)),
    }))
    .filter((g) => g.items.length > 0);
}
