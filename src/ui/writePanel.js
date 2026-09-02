/**
 * 학습 3단계(직접 작성) 화면 (요구사항 5.3).
 * 학생이 파이썬 search()를 직접 쓰고 실행하면, Pyodide로 진짜 파이썬을 돌려
 * 돌려준 경로를 옆 패널에서 애니메이션한다. 오류는 한국어로 설명한다.
 *
 * 텍스트영역은 다시 그릴 때 커서를 잃으므로 딱 한 번만 만들고, 상태 영역만 갱신한다.
 */
import { el } from './dom.js';
import { STARTER, ANSWER } from '../app/pyCode.js';
import { GOAL, PRESETS } from '../app/config.js';
import { findById } from '../app/state.js';
import { validatePath, pathToResult } from '../core/pathTrace.js';
import { translateError } from '../core/pyErrors.js';

const CODE_KEY = 'puzzle8-lab:code';

function loadSavedCode() {
  try { return localStorage.getItem(CODE_KEY) ?? STARTER; } catch { return STARTER; }
}
function saveCode(code) {
  try { localStorage.setItem(CODE_KEY, code); } catch { /* 저장 못 해도 진행 */ }
}

/** 학습 3단계 화면을 한 번 만들어 돌려준다(이후 재사용). */
export function buildWritePanel(store, player, runner) {
  const editor = el('textarea.code-editor', {
    spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off', wrap: 'off',
    'aria-label': '파이썬 코드 편집기',
  });
  editor.value = loadSavedCode();
  editor.addEventListener('input', () => saveCode(editor.value));
  // Tab 키로 공백 4칸 넣기 (편집기 밖으로 초점이 튀지 않게)
  editor.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const s = editor.selectionStart;
    const eEnd = editor.selectionEnd;
    editor.value = `${editor.value.slice(0, s)}    ${editor.value.slice(eEnd)}`;
    editor.selectionStart = editor.selectionEnd = s + 4;
    saveCode(editor.value);
  });

  const status = el('div.write-status', { role: 'status', 'aria-live': 'polite' });

  const runBtn = el('button.ctrl.ctrl--primary', { type: 'button' }, '내 코드 실행 ▶');
  const answerBtn = el('button.pill', { type: 'button', disabled: true, title: '한 번 실행해 본 뒤 열립니다' }, '정답 보기');
  const resetBtn = el('button.pill', { type: 'button' }, '처음 코드로');

  let ranOnce = false;

  function setStatus(kind, ...children) {
    status.className = `write-status write-status--${kind}`;
    status.replaceChildren(...children.filter(Boolean));
  }

  function currentStart() {
    return findById(PRESETS, store.get().presetId).state;
  }

  async function onRun() {
    runBtn.disabled = true;
    setStatus('busy', el('span', {}, '실행 준비 중…'));
    try {
      await runner.ensureReady((msg) => { if (msg) setStatus('busy', el('span', {}, msg)); });
      setStatus('busy', el('span', {}, '파이썬으로 탐색을 실행하는 중…'));
      const start = currentStart();
      const out = await runner.run(editor.value, start, GOAL);

      ranOnce = true;
      answerBtn.disabled = false;
      answerBtn.title = '';

      if (!out.ok) {
        if (out.kind === 'no-path') {
          player.clear();
          setStatus('info',
            el('div.write-status__head', {}, '코드가 None을 돌려주었습니다 (경로를 못 찾음).'),
            el('div.write-status__body', {}, '자식들을 OPEN에 넣는 부분(TODO)을 채웠는지 확인해 보세요.'));
          return;
        }
        if (out.kind === 'no-search') {
          setStatus('error',
            el('div.write-status__head', {}, 'search 함수를 찾지 못했습니다.'),
            el('div.write-status__body', {}, '`def search(start, goal):` 형태로 정의했는지 확인하세요.'));
          return;
        }
        const t = translateError(out.error);
        setStatus('error',
          el('div.write-status__head', {}, t.ko),
          el('pre.write-status__raw', {}, t.detail));
        return;
      }

      // 경로 검증 (요구사항 5.3.2 — 결과를 시각화하기 전에 규칙 확인)
      const check = validatePath(out.path, start, GOAL);
      if (!check.ok) {
        player.clear();
        setStatus('error', el('div.write-status__head', {}, invalidReason(check)));
        return;
      }

      const moves = out.path.length - 1;
      player.loadResult(pathToResult(out.path));
      setStatus('ok',
        el('div.write-status__head', {}, `잘했어요! ${moves}수짜리 경로를 찾았습니다.`),
        el('div.write-status__body', {}, '오른쪽 ▶ 재생으로 내 해가 움직이는 모습을 확인하세요. (최단은 아닐 수 있어요.)'));
    } catch (err) {
      const t = translateError(err && err.message ? err.message : err);
      setStatus('error', el('div.write-status__head', {}, t.ko), el('pre.write-status__raw', {}, t.detail));
    } finally {
      runBtn.disabled = false;
    }
  }

  runBtn.addEventListener('click', onRun);
  answerBtn.addEventListener('click', () => {
    if (!ranOnce) return;
    editor.value = ANSWER;
    saveCode(editor.value);
    setStatus('info', el('div.write-status__head', {}, '정답(너비 우선 탐색)을 넣었습니다. 실행해 보세요.'));
  });
  resetBtn.addEventListener('click', () => {
    editor.value = STARTER;
    saveCode(editor.value);
    setStatus('info', el('div.write-status__head', {}, '처음 코드로 되돌렸습니다.'));
  });

  setStatus('info',
    el('div.write-status__body', {},
      '아래 코드를 고친 뒤 ', el('strong', {}, '내 코드 실행 ▶'), '을 누르세요. ',
      '처음 실행할 때 파이썬 실행기를 한 번 내려받습니다(수십 초).'));

  return el('div.write-panel', {},
    el('p.fill-intro', {}, 'search(start, goal) 함수를 완성해 8-퍼즐을 풀어 보세요. 돌려준 경로가 오른쪽에서 재생됩니다.'),
    el('div.write-actions', {}, runBtn, answerBtn, resetBtn),
    editor,
    status,
  );
}

function invalidReason(check) {
  switch (check.reason) {
    case 'empty': return '돌려준 경로가 비어 있습니다. 상태들의 리스트를 돌려주세요.';
    case 'start': return '경로가 시작 상태에서 출발하지 않습니다. 첫 상태가 start여야 합니다.';
    case 'goal': return '경로의 마지막이 목표 상태가 아닙니다.';
    case 'move': return `${check.at}번째 상태가 규칙에 맞지 않는 이동입니다(빈칸과 이웃 타일만 바꿀 수 있어요).`;
    default: return '돌려준 경로가 올바르지 않습니다.';
  }
}
