/**
 * FLIP 애니메이션 도우미 — 자료구조(OPEN 관·CLOSED 상자·자료구조 탭)에서 항목이
 * 순간이동하지 않고 "눈에 보이게" 미끄러져 들어가고 나가게 한다.
 *
 * 화면은 프레임마다 통째로 다시 그려진다(항목 DOM이 새로 만들어진다). 그래서
 * 이전 프레임의 위치를 기억해 두었다가, 같은 id의 항목이 새 위치로 "이동"하도록
 * 되돌린 뒤 풀어 준다(First-Last-Invert-Play). 새로 생긴 항목은 넣는 쪽에서 미끄러져 들어온다.
 *
 * 쓰는 법:
 *   const flip = createFlip();
 *   // 다시 그린 뒤(항목에 data-flip="고유id", 선택적 data-enter="left|right|up")
 *   flip(container);
 */
export function createFlip() {
  let last = new Map();   // id -> {left, top}

  return function flip(container, { reset = false } = {}) {
    if (!container) return;
    // 쪽/알고리즘이 바뀌면 옛 위치 기억을 버린다 — 같은 id라도 새로 미끄러져 들어오게.
    if (reset) last = new Map();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = container.querySelectorAll('[data-flip]');
    const now = new Map();

    items.forEach((elm) => {
      const id = elm.getAttribute('data-flip');
      const r = elm.getBoundingClientRect();
      now.set(id, { left: r.left, top: r.top });
      if (reduce) return;

      const prev = last.get(id);
      if (prev) {
        // 이미 있던 항목 — 옛 자리에서 새 자리로 미끄러진다
        const dx = prev.left - r.left;
        const dy = prev.top - r.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          elm.style.transition = 'none';
          elm.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            elm.style.transition = 'transform .3s cubic-bezier(.4, 0, .2, 1)';
            elm.style.transform = '';
          });
        }
      } else {
        // 새로 들어온 항목 — 넣는 쪽에서 미끄러져 들어온다
        const dir = elm.getAttribute('data-enter');
        const tx = dir === 'left' ? -30 : dir === 'right' ? 30 : 0;
        const ty = dir === 'up' ? -26 : dir === 'left' || dir === 'right' ? 0 : 10;
        elm.style.transition = 'none';
        elm.style.transform = `translate(${tx}px, ${ty}px) scale(.7)`;
        elm.style.opacity = '0';
        requestAnimationFrame(() => {
          elm.style.transition = 'transform .34s cubic-bezier(.34, 1.3, .5, 1), opacity .3s ease';
          elm.style.transform = '';
          elm.style.opacity = '';
        });
      }
    });

    last = now;
  };
}
