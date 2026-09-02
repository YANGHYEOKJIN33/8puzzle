/**
 * Pyodide로 학생 파이썬 코드를 실제로 실행하는 실행기 (요구사항 5.3.1).
 *
 * 요구사항 7.2.1 : Pyodide(수십 MB)는 학습 3단계에 처음 들어올 때만 내려받는다.
 * 이 모듈은 그 외 화면과 완전히 분리돼 있어, 1·2단계 사용자는 건드리지 않는다.
 *
 * 실행기는 갈아 끼울 수 있다(테스트에서는 가짜 실행기를 주입). 인터페이스:
 *   ensureReady(onProgress) -> Promise<void>
 *   run(code, start, goal)  -> Promise<{ ok, path?, error?, kind? }>
 */
import { PREAMBLE } from './pyCode.js';

const PYODIDE_VERSION = 'v0.26.2';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let pyodide = null;
let loadingPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-pyodide]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.pyodide = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Pyodide를 내려받지 못했습니다. 인터넷 연결을 확인해 주세요.'));
    document.head.appendChild(script);
  });
}

export function createPyRunner() {
  return {
    /** Pyodide를 (한 번만) 내려받고 준비한다. */
    async ensureReady(onProgress = () => {}) {
      if (pyodide) return;
      if (!loadingPromise) {
        loadingPromise = (async () => {
          onProgress('파이썬 실행기를 내려받는 중… (처음 한 번만, 수십 초 걸릴 수 있어요)');
          await loadScriptOnce(`${PYODIDE_URL}pyodide.js`);
          onProgress('파이썬을 준비하는 중…');
          // eslint-disable-next-line no-undef
          pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
          pyodide.runPython(PREAMBLE);
          onProgress('');
        })();
      }
      await loadingPromise;
    },

    /**
     * 학생 코드를 실행하고 search(start, goal)의 결과를 돌려준다.
     * @returns {{ ok, path?, error?, kind? }}
     *   kind: 'error'(예외) | 'no-search'(search 없음) | 'no-path'(None)
     */
    async run(code, start, goal) {
      await this.ensureReady();
      // 시작·목표를 파이썬 튜플로 넣고, 실행마다 스텝 카운터를 되돌린다
      pyodide.runPython(`_EXPAND_CALLS = 0\nstart = ${tuple(start)}\ngoal = ${tuple(goal)}`);
      try {
        pyodide.runPython(code);   // 학생 코드: def search(...) 등을 정의
      } catch (e) {
        return { ok: false, kind: 'error', error: String(e.message ?? e) };
      }
      // search가 정의됐는지 확인
      const hasSearch = pyodide.runPython('"search" in dir() and callable(search)');
      if (!hasSearch) return { ok: false, kind: 'no-search', error: "name 'search' is not defined" };

      let proxy;
      try {
        proxy = pyodide.runPython('search(start, goal)');
      } catch (e) {
        return { ok: false, kind: 'error', error: String(e.message ?? e) };
      }
      if (proxy === undefined || proxy === null) {
        return { ok: false, kind: 'no-path' };
      }
      // 파이썬 리스트[튜플] → JS 배열[배열]
      const path = proxy.toJs ? proxy.toJs().map((s) => Array.from(s)) : null;
      if (proxy.destroy) proxy.destroy();
      if (!path) return { ok: false, kind: 'no-path' };
      return { ok: true, path };
    },
  };
}

function tuple(arr) {
  return `(${arr.join(', ')})`;
}
