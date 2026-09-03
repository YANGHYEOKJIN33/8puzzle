/**
 * 실행 제어 (요구사항 4.3) — 재생기를 조종한다.
 * 되감기는 필수(요구사항 4.3.1). 키보드만으로도 조작된다(요구사항 6.3.1).
 */
import { el, fill } from './dom.js';
import { SPEEDS } from '../app/config.js';

const BUTTONS = [
  { id: 'reset', label: '⏹ 처음으로', key: 'Home' },
  { id: 'back',  label: '⏮ 뒤로',     key: '←' },
  { id: 'play',  label: '▶ 재생',     key: 'Space', primary: true },
  { id: 'step',  label: '⏭ 한 단계',  key: '→' },
  { id: 'skip',  label: '⏩ 해까지',   key: 'End' },
];

export function mountControls(root, store, player) {
  const buttons = new Map();

  const handlers = {
    reset: () => player.reset(),
    back:  () => player.step(-1),
    play:  () => player.toggle(),
    step:  () => player.step(1),
    skip:  () => player.skipToEnd(),
  };

  for (const spec of BUTTONS) {
    const button = el(`button.ctrl${spec.primary ? '.ctrl--primary' : ''}`, {
      type: 'button', title: `${spec.label} (${spec.key})`, 'data-action': spec.id,
      onclick: handlers[spec.id],
    }, spec.label);
    buttons.set(spec.id, button);
  }

  const speedSelect = el('select', {
    id: 'speed-select',
    onchange: (e) => store.set({ speedId: e.target.value }),
  }, SPEEDS.map((s) => el('option', { value: s.id }, s.name)));

  fill(root,
    ...buttons.values(),
    el('div.speed', {}, el('label', { for: 'speed-select' }, '속도'), speedSelect),
    el('span.topbar__spacer'),
    el('span.panel__hint', {},
      '단축키 ', el('kbd', {}, 'Space'), ' 재생 · ', el('kbd', {}, '→'), ' 한 단계 · ', el('kbd', {}, '←'), ' 뒤로'),
  );

  // 키보드 조작 (요구사항 6.3.1)
  document.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;
    // 자료구조 탭에서는 실행 제어가 화면에 없다 — 단축키도 듣지 않는다
    if (document.body.classList.contains('mode-ds')) return;
    const map = { ' ': 'play', ArrowRight: 'step', ArrowLeft: 'back', Home: 'reset', End: 'skip' };
    const action = map[event.key];
    const button = action && buttons.get(action);
    if (!button || button.disabled) return;
    event.preventDefault();
    button.click();
  });

  store.subscribe((state) => { speedSelect.value = state.speedId; });

  player.subscribe((v) => {
    const ready = !v.empty;
    buttons.get('reset').disabled = !ready || v.atStart;
    buttons.get('back').disabled = !ready || v.atStart;
    buttons.get('step').disabled = !ready || v.atEnd;
    buttons.get('skip').disabled = !ready || v.atEnd;
    buttons.get('play').disabled = false;   // 재생은 언제나 눌러 시작할 수 있다
    buttons.get('play').textContent = v.playing ? '⏸ 일시정지' : (v.atEnd && ready ? '↻ 다시 재생' : '▶ 재생');
  });
}
