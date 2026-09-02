/**
 * 진입점 — 화면 부품을 붙이고, 보기 설정(테마·글자 크기)을 화면에 반영한다.
 *
 * 개발 2단계 범위: 뼈대와 배치까지.
 * 탐색 엔진(src/core/)과 실행 제어 연결은 3~5단계에서 이 파일에 이어 붙인다.
 */
import { createStore } from './state.js';
import { qs } from '../ui/dom.js';
import { mountTopbar } from '../ui/topbar.js';
import { mountStagebar } from '../ui/stagebar.js';
import { mountBoardPanel } from '../ui/boardPanel.js';
import { mountCodePanel } from '../ui/codePanel.js';
import { mountDataPanel } from '../ui/dataPanel.js';
import { mountControls } from '../ui/controls.js';

const store = createStore();

mountTopbar(qs('#topbar'), store);
mountStagebar(qs('#stagebar'), store);
mountCodePanel(qs('#panel-code'), store);
mountBoardPanel(qs('#panel-board'), store);
mountDataPanel(qs('#panel-data'), store);
mountControls(qs('#controlbar'), store);

// 보기 설정을 문서 뿌리에 반영한다 (요구사항 6.2.2 · 6.3.3)
store.subscribe((state) => {
  const root = document.documentElement;
  if (state.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', state.theme);
  root.style.setProperty('--scale', String(state.scale));
});

// 개발 중 확인용 — 콘솔에서 상태를 들여다볼 수 있게 한다
globalThis.__puzzle8 = { store };
