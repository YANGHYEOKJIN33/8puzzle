/** 화면 부품이 공통으로 쓰는 아주 작은 도우미들 (외부 라이브러리 없이) */

/**
 * el('button.pill', { onclick, 'aria-pressed': true }, '내용')
 * 태그 이름 뒤에 .클래스 를 붙여 쓸 수 있다.
 */
export function el(spec, attrs = {}, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2), value);
    } else if (key === 'html') {
      node.innerHTML = value;
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }

  // 깊게 편다 — 자식을 map/flatMap으로 만들 때 배열이 겹쳐도 안전하게
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** 자식을 모두 지우고 새로 채운다 */
export function fill(parent, ...children) {
  parent.replaceChildren(...children.flat(Infinity).filter(Boolean));
  return parent;
}

export function qs(selector, root = document) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`화면 요소를 찾지 못했습니다: ${selector}`);
  return node;
}
