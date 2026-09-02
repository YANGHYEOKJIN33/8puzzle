/**
 * 실행 제어 (요구사항 4.3).
 * 되감기는 필수 기능이므로 버튼과 단축키를 2단계에서 미리 자리 잡아 둔다.
 * 실제 동작은 탐색 엔진이 붙는 4~5단계에서 연결한다.
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

export function mountControls(root, store) {
  const buttons = new Map();

  for (const spec of BUTTONS) {
    buttons.set(spec.id, el(`button.ctrl${spec.primary ? '.ctrl--primary' : ''}`, {
      type: 'button',
      disabled: true,
      title: `${spec.label} (${spec.key})`,
      'data-action': spec.id,
    }, spec.label));
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
      '단축키 ', el('kbd', {}, 'Space'), ' 재생 · ',
      el('kbd', {}, '→'), ' 한 단계 · ', el('kbd', {}, '←'), ' 뒤로',
    ),
  );

  // 요구사항 6.3.1: 키보드만으로 실행 제어가 가능해야 한다
  document.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;

    const map = { ' ': 'play', ArrowRight: 'step', ArrowLeft: 'back', Home: 'reset', End: 'skip' };
    const action = map[event.key];
    if (!action) return;

    const button = buttons.get(action);
    if (!button || button.disabled) return;
    event.preventDefault();
    button.click();
  });

  store.subscribe((state) => { speedSelect.value = state.speedId; });

  // 탐색 엔진이 붙으면 main.js가 이 함수로 버튼을 살린다
  return {
    on(action, handler) { buttons.get(action)?.addEventListener('click', handler); },
    setEnabled(enabled) { for (const button of buttons.values()) button.disabled = !enabled; },
  };
}
