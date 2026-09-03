/**
 * 앱 상태 저장소.
 *
 * 요구사항 7.5.1 — 알고리즘 로직과 화면 표시 코드를 분리한다.
 * 화면 부품은 상태를 직접 고치지 않고 set()만 부르며, 그리기는 구독으로 처리한다.
 */

/** 새로 고쳐도 학생이 고른 설정이 남도록 저장하는 열쇠 (요구사항 5.3.6 · Q4) */
const STORAGE_KEY = 'puzzle8-lab:prefs';

/** 저장해 둘 값 — 학습 진도가 아니라 "고른 설정"만 남긴다 */
const PERSISTED = ['algorithmId', 'stageId', 'heuristicId', 'presetId', 'speedId', 'theme', 'scale', 'lessonStep', 'mode', 'dsStep'];

const initial = {
  // 무엇을 배우는 중인가 — 두 개의 탭
  //   ds     : 자료구조 배우기 (큐·스택·우선순위 큐를 손으로 다뤄 본다) — 기본 화면
  //   search : 8-퍼즐 탐색 배우기
  // 자료구조를 배운 적 없는 학생이 많으므로 여기서 시작한다.
  mode: 'ds',
  dsStep: 0,            // 자료구조 탭의 몇 번째 쪽인가

  // 학생이 고르는 것 (요구사항 6.1.1 — 첫 화면의 결정은 두 개뿐)
  algorithmId: 'bfs',
  stageId: 'pseudo',

  // 기본값으로 동작하는 것
  heuristicId: 'h2',
  presetId: 'intro',
  speedId: 'normal',

  // 보기 설정
  theme: 'auto',        // auto | light | dark
  scale: 1,             // 글자 크기 배율 (요구사항 6.2.2)
  codeView: 'pseudo',   // 코드 패널에 무엇을 보일지: flow | pseudo | python
  dataView: 'open',     // (예전 탭 잔재 — 지금은 OPEN·트리를 함께 보여 준다)
  lessonStep: 0,        // 레슨 몇 번째 페이지인가 (0부터)

  // 실행 상태 (탐색 엔진은 3·4단계에서 붙인다)
  running: false,
  stepIndex: 0,
  totalSteps: 0,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw);
    const out = {};
    for (const key of PERSISTED) {
      if (key in saved) out[key] = saved[key];
    }
    return out;
  } catch {
    // 사생활 보호 모드 등에서 접근이 막힐 수 있다 — 기본값으로 조용히 넘어간다
    return {};
  }
}

function savePrefs(state) {
  try {
    const out = {};
    for (const key of PERSISTED) out[key] = state[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch {
    /* 저장하지 못해도 학습에는 지장이 없다 */
  }
}

export function createStore() {
  let state = { ...initial, ...loadPrefs() };
  const listeners = new Set();

  return {
    get() {
      return state;
    },

    /** 바뀐 값만 넘긴다. 실제로 달라진 것이 없으면 아무도 다시 그리지 않는다. */
    set(patch) {
      let changed = false;
      for (const [key, value] of Object.entries(patch)) {
        if (state[key] !== value) { changed = true; break; }
      }
      if (!changed) return state;

      const prev = state;
      state = { ...state, ...patch };
      savePrefs(state);
      for (const listener of listeners) listener(state, prev);
      return state;
    },

    /** 구독 즉시 한 번 그려 주고, 구독 해제 함수를 돌려준다. */
    subscribe(listener) {
      listeners.add(listener);
      listener(state, state);
      return () => listeners.delete(listener);
    },
  };
}

/** 편의 조회 함수 — 화면 부품이 목록을 매번 뒤지지 않도록 */
export function findById(list, id) {
  return list.find((item) => item.id === id) ?? list[0];
}
