// 轻量 DOM 工具

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function clear(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function on<K extends keyof HTMLElementEventMap>(
  node: HTMLElement,
  type: K | string,
  fn: (ev: Event) => void,
): void {
  node.addEventListener(type, fn as EventListener);
}

export function show(node: HTMLElement): void {
  node.classList.remove('hidden');
}

export function hide(node: HTMLElement): void {
  node.classList.add('hidden');
}

export function toast(msg: string, ms = 1800): void {
  let box = document.getElementById('toast-box');
  if (!box) {
    box = el('div', 'toast-box');
    box.id = 'toast-box';
    document.body.appendChild(box);
  }
  const item = el('div', 'toast', msg);
  box.appendChild(item);
  setTimeout(() => item.remove(), ms);
}

let modalEl: HTMLElement | null = null;

/** 通用模态框：返回确认按钮的 promise */
export function modal(title: string, body: HTMLElement, buttons: Array<{ label: string; cls?: string; on?: () => void }>): void {
  closeModal();
  const overlay = el('div', 'modal-overlay');
  modalEl = overlay;
  const box = el('div', 'modal-box');
  box.appendChild(el('div', 'modal-title', title));
  box.appendChild(body);
  const row = el('div', 'modal-actions');
  for (const b of buttons) {
    const btn = el('button', `btn ${b.cls ?? 'btn-ghost'}`, b.label);
    on(btn, 'click', () => {
      closeModal();
      b.on?.();
    });
    row.appendChild(btn);
  }
  box.appendChild(row);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

export function closeModal(): void {
  modalEl?.remove();
  modalEl = null;
}

/** 二级确认对话框 */
export function confirmModal(message: string, onConfirm: () => void, confirmLabel = '确定'): void {
  const body = el('div', 'confirm-body', message);
  modal('确认操作', body, [
    { label: '取消' },
    { label: confirmLabel, cls: 'btn-danger', on: onConfirm },
  ]);
}
