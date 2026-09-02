/**
 * 재생기 — 단계 기록(trace)을 "한 장면씩 넘겨 보는" 장치.
 *
 * 요구사항 4.3 : 재생 / 일시정지 / 한 단계 / 한 단계 뒤로 / 처음으로 / 해까지
 * 요구사항 4.3.1 : 되감기는 필수. 기록이 델타로 되어 있어 앞뒤로 자유롭게 오간다.
 * 요구사항 7.5.1 : 화면은 이 재생기가 내주는 "현재 장면(view)"만 그린다.
 *
 * 화면 부품은 player.subscribe(fn)로 장면 바뀜을 구독하고,
 * fn(view)에서 자기 패널만 다시 그린다.
 */
import { SPEEDS, MAX_EXPANSIONS, PRESETS } from './config.js';
import { runAlgorithm } from '../core/algorithms/index.js';
import { getHeuristic } from '../core/heuristics.js';
import { findById } from './state.js';

/** 델타를 0번부터 index번 프레임까지 적용해 그 시점의 OPEN(노드 id 배열)을 만든다 */
function openAt(frames, index) {
  const open = [];
  for (let i = 0; i <= index; i += 1) {
    const { op, id, end, index } = frames[i].delta;
    if (op === 'push') {
      if (end === 'front') open.unshift(id);
      else open.push(id);
    } else if (op === 'insert') {
      open.splice(index, 0, id);
    } else if (op === 'pop') {
      if (end === 'front') open.shift();
      else open.pop();
    } else if (op === 'clear') {
      open.length = 0;
    }
  }
  return open;
}

/** 해가 있으면 시작→목표 경로에 놓인 노드 id들의 집합을 만든다 (요구사항 4.3.4) */
function pathIdSet(result) {
  const ids = new Set();
  if (!result.solution.found) return ids;
  let node = result.solution.node;
  while (node) {
    ids.add(node.id);
    node = node.parent === null ? null : result.nodes[node.parent];
  }
  return ids;
}

export function createPlayer(store) {
  let result = null;      // 현재 탐색 결과 (trace)
  let frames = [];
  let index = 0;
  let pathIds = new Set();
  let timer = null;
  const listeners = new Set();

  /** 지금 장면을 화면이 쓰기 좋은 형태로 묶는다 */
  function view() {
    if (!result || frames.length === 0) {
      return { empty: true };
    }
    const frame = frames[index];
    const node = frame.currentId === null ? null : result.nodes[frame.currentId];
    return {
      empty: false,
      ready: true,
      nodes: result.nodes,
      frame,
      index,
      total: frames.length,
      node,
      openIds: openAt(frames, index),
      closedSize: frame.closedSize,
      counters: frame.counters,
      line: frame.line,
      action: frame.action,
      narration: frame.narration,
      highlight: frame.highlight,
      atStart: index === 0,
      atEnd: index === frames.length - 1,
      nextAction: index + 1 < frames.length ? frames[index + 1].action : null,
      playing: timer !== null,
      solution: result.solution,
      pathIds,
      finished: frame.action === 'goal' || frame.action === 'exhausted' || frame.action === 'limit',
    };
  }

  function emit() {
    const snapshot = view();
    for (const fn of listeners) fn(snapshot);
  }

  function goTo(target) {
    if (!result) return;
    index = Math.max(0, Math.min(frames.length - 1, target));
    emit();
  }

  function pause() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
      emit();
    }
  }

  function play() {
    if (!result || timer !== null) return;
    if (index >= frames.length - 1) index = 0;   // 끝에서 재생을 누르면 처음부터
    const speed = findById(SPEEDS, store.get().speedId);
    timer = setInterval(() => {
      if (index >= frames.length - 1) { pause(); return; }
      index += 1;
      emit();
    }, speed.ms);
    emit();
  }

  return {
    /** 지금 store의 알고리즘·초기 상태·휴리스틱으로 탐색을 돌려 기록을 싣는다 */
    load() {
      pause();
      const state = store.get();
      const preset = findById(PRESETS, state.presetId);
      return this.loadWith(state.algorithmId, preset ? preset.state : null, {
        heuristic: getHeuristic(state.heuristicId),
      });
    },

    /** 알고리즘 id와 시작 상태를 직접 주어 싣는다 (테스트·직접 호출용) */
    loadWith(algorithmId, startState, options = {}) {
      pause();
      if (!startState) { result = null; frames = []; index = 0; emit(); return null; }
      result = runAlgorithm(algorithmId, startState, { limit: MAX_EXPANSIONS, ...options });
      if (!result) { frames = []; index = 0; emit(); return null; }
      frames = result.frames;
      pathIds = pathIdSet(result);
      index = 0;
      emit();
      return result;
    },

    step(dir) { pause(); goTo(index + (dir < 0 ? -1 : 1)); },
    reset() { pause(); goTo(0); },
    skipToEnd() { pause(); goTo(frames.length - 1); },
    play,
    pause,
    toggle() { if (timer !== null) pause(); else play(); },

    hasTrace() { return result !== null; },
    view,

    subscribe(fn) {
      listeners.add(fn);
      fn(view());
      return () => listeners.delete(fn);
    },
  };
}
