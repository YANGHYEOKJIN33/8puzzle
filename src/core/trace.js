/**
 * 단계 기록기 — 탐색이 "한 걸음마다 무슨 일을 했는지"를 목록으로 남긴다.
 *
 * 요구사항 7.5.1 : 알고리즘은 화면을 모른다. 대신 이 기록(frame 목록)만 만든다.
 * 요구사항 4.3.1 : 화면은 이 목록을 앞뒤로 오가며 그리기만 하므로 되감기가 쉽다.
 * 요구사항 7.3.3 : 브라우저를 멈추게 하지 않는다.
 *
 * ── OPEN을 통째로 복사하지 않는 이유 ────────────────────────────────
 * 프레임마다 OPEN 전체를 복사하면, OPEN이 커질수록 한 프레임의 비용이 커져
 * 전체가 O(단계수²)가 된다. 깊이 우선 탐색처럼 OPEN이 길게 자라는 경우
 * 이것만으로 브라우저가 몇 초씩 멈춘다.
 *
 * 그래서 프레임에는 "이번에 OPEN이 어떻게 바뀌었는지"(delta)만 담는다.
 *   delta = { op: 'push'|'insert'|'pop'|'clear'|'none', id, end, index }
 * 화면은 OPEN 배열 하나를 들고 있다가, 한 걸음 나아갈 때 delta를 적용하고
 * 한 걸음 되돌아갈 때 delta를 거꾸로 적용한다 (openSequence 참고).
 *
 * 한 프레임(frame)의 생김새
 *   {
 *     line       : 강조할 의사코드/파이썬 줄 번호 (1부터)
 *     action     : 'init'|'pop'|'goal'|'make'|'push'|'skip'|'exhausted'|'limit'
 *     narration  : 학생에게 보여 줄 한 문장 설명 (요구사항 5.1.1)
 *     currentId  : 지금 다루는 노드 id (없으면 null)
 *     delta      : 이번에 OPEN이 바뀐 내용
 *     openSize   : 이 시점 OPEN의 크기
 *     highlight  : 방금 넣거나 꺼낸 노드 id — 초록/회색 강조 (요구사항 4.2.2)
 *     closedSize : 이 시점 CLOSED의 크기
 *     counters   : { generated, expanded, maxOpen, depth } (요구사항 4.2.5)
 *   }
 *
 * 노드 자체(state 포함)는 프레임마다 넣지 않고 registry에 한 번만 담는다.
 */

let nextNodeId = 0;

/** 탐색 노드 하나를 만든다. 만드는 순간 "생성한 노드" 수가 하나 는다. */
export function makeNode({ state, parent = null, g = 0, h = 0, moveLabel = null }) {
  return {
    id: nextNodeId++,
    state,
    parent: parent ? parent.id : null,
    parentState: parent ? parent.state : null,
    depth: parent ? parent.depth + 1 : 0,
    g,
    h,
    f: g + h,
    moveLabel,   // 부모에서 여기로 온 연산자 이름 (예: '빈칸 ↑')
  };
}

/** 노드에서 시작까지 부모를 거슬러 올라가 경로(상태들의 목록)를 만든다 (요구사항 4.3.4) */
export function reconstructPath(registry, node) {
  const path = [];
  let current = node;
  while (current) {
    path.push(current.state);
    current = current.parent === null ? null : registry.get(current.parent);
  }
  return path.reverse();
}

const NO_DELTA = Object.freeze({ op: 'none', id: null, end: null });

/**
 * 기록기. 알고리즘이 이걸 하나 만들어 쓰며, 다 끝나면 finish()로 결과를 받는다.
 */
export class Recorder {
  constructor() {
    this.registry = new Map();     // id → node
    this.frames = [];
    this.generated = 0;
    this.expanded = 0;
    this.maxOpen = 0;
  }

  /** 노드를 만들어 등록하고 "생성한 노드" 수를 센다 */
  node(spec) {
    const node = makeNode(spec);
    this.registry.set(node.id, node);
    this.generated += 1;
    return node;
  }

  /** 노드 하나를 확장했다(자식을 만들었다)고 표시 — "확장한 노드" 수를 센다 */
  countExpanded() {
    this.expanded += 1;
  }

  /**
   * 프레임 하나를 남긴다.
   * @param openSize 이 시점 OPEN 크기 (엔진이 알려 준다 — 여기서 배열을 복사하지 않는다)
   * @param delta    이번에 OPEN이 바뀐 내용 (기본: 변화 없음)
   */
  frame({
    line, action, narration, current = null,
    openSize = 0, delta = NO_DELTA, highlight = null, closedSize = 0,
  }) {
    this.maxOpen = Math.max(this.maxOpen, openSize);
    this.frames.push({
      line,
      action,
      narration,
      currentId: current ? current.id : null,
      delta,
      openSize,
      highlight,
      closedSize,
      counters: {
        generated: this.generated,
        expanded: this.expanded,
        maxOpen: this.maxOpen,
        depth: current ? current.depth : 0,
      },
    });
  }

  /** 탐색을 마치며 결과를 묶어 돌려준다. */
  finish({ solutionNode = null, reason = null }) {
    const found = Boolean(solutionNode);
    const path = found ? reconstructPath(this.registry, solutionNode) : null;
    return {
      nodes: Object.fromEntries(this.registry),   // 화면이 id로 state를 찾아 쓴다
      frames: this.frames,
      solution: {
        found,
        reason,                                  // 못 찾았을 때의 까닭
        path,                                    // 상태들의 목록 (요구사항 4.3.4)
        moves: path ? path.length - 1 : null,    // 해의 길이(민 횟수)
        node: solutionNode,
      },
      stats: {
        generated: this.generated,
        expanded: this.expanded,
        maxOpen: this.maxOpen,
        frames: this.frames.length,
        solutionMoves: path ? path.length - 1 : null,
      },
    };
  }
}

/**
 * 델타를 되짚어 각 프레임 시점의 OPEN(노드 id 배열)을 통째로 만들어 돌려준다.
 *
 * 화면은 이걸 쓰지 않고 한 걸음씩 델타만 적용하는 편이 빠르다.
 * 이 함수는 주로 테스트나, 특정 시점으로 건너뛸 때 쓰라고 둔다.
 * 결과[i]는 i번째 프레임이 끝난 뒤의 OPEN이다.
 */
export function openSequence(frames) {
  const sequence = [];
  const open = [];
  for (const frame of frames) {
    const { op, id, end, index } = frame.delta;
    if (op === 'push') {
      if (end === 'front') open.unshift(id);
      else open.push(id);
    } else if (op === 'insert') {          // 우선순위 큐: 정렬된 자리에 끼워 넣기
      open.splice(index, 0, id);
    } else if (op === 'pop') {
      if (end === 'front') open.shift();
      else open.pop();
    } else if (op === 'clear') {           // 반복적 깊이 심화: 한 회가 끝나 OPEN 비우기
      open.length = 0;
    }
    sequence.push(open.slice());
  }
  return sequence;
}

/** 테스트가 매번 같은 id를 보도록 초기화할 때 쓴다 */
export function _resetNodeIds() {
  nextNodeId = 0;
}
