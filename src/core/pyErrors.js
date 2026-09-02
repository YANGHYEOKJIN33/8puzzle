/**
 * 파이썬 오류 메시지를 학생이 알아들을 한국어 설명으로 옮긴다 (요구사항 5.3.3).
 * Pyodide가 던진 오류의 원문(주로 마지막 줄)을 받아, 흔한 실수에 친절한 안내를 붙인다.
 */

const RULES = [
  {
    match: /IndexError:\s*pop from empty list/i,
    ko: 'OPEN이 비었는데 꺼내려 했습니다. 꺼내기 전에 "비어 있지 않은가"를 먼저 확인했나요?',
  },
  {
    match: /NameError:\s*name '(\w+)' is not defined/i,
    ko: (m) => `'${m[1]}' 를 찾을 수 없습니다. 이름을 잘못 적었거나, 아직 만들지 않은 변수/함수입니다. (쓸 수 있는 것: start, goal, expand, is_goal, h1, h2)`,
  },
  {
    match: /SyntaxError|IndentationError|TabError/i,
    ko: '문법 오류입니다. 들여쓰기(공백 4칸)나 콜론(:), 괄호 짝을 확인해 보세요.',
  },
  {
    match: /RecursionError/i,
    ko: '함수가 자기 자신을 너무 깊이 불렀습니다(무한 재귀). 멈추는 조건이 있는지 확인하세요.',
  },
  {
    match: /TypeError:.*not (subscriptable|iterable)/i,
    ko: '값의 종류가 맞지 않습니다. 리스트가 아닌 것을 리스트처럼 쓰지 않았는지 확인하세요.',
  },
  {
    match: /(탐색이 너무 오래|too many steps|step limit)/i,
    ko: '탐색이 너무 오래 걸립니다(너무 많은 상태를 펼쳤습니다). 이미 본 상태를 다시 보지 않도록 CLOSED를 쓰고 있나요?',
  },
  {
    match: /search.*not defined|name 'search' is not defined/i,
    ko: 'search 함수를 찾을 수 없습니다. `def search(start, goal):` 형태로 정의했는지 확인하세요.',
  },
];

/** 파이썬 오류 원문 → 한국어 설명(+ 원문 요약) */
export function translateError(raw) {
  const text = String(raw ?? '').trim();
  // 여러 줄이면 의미 있는 마지막 줄을 고른다
  const lastLine = text.split('\n').map((s) => s.trim()).filter(Boolean).pop() ?? text;

  for (const rule of RULES) {
    const m = lastLine.match(rule.match) ?? text.match(rule.match);
    if (m) {
      const ko = typeof rule.ko === 'function' ? rule.ko(m) : rule.ko;
      return { ko, detail: lastLine };
    }
  }
  return { ko: '코드를 실행하는 중 문제가 생겼습니다. 아래 원문을 참고하세요.', detail: lastLine };
}
