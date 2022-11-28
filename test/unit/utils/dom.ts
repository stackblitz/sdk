/**
 * Build a HTMLElement with attributes
 */
export function h(name: string, attrs: Record<string, string> = {}) {
  const element = document.createElement(name);
  for (const [key, val] of Object.entries(attrs)) {
    element.setAttribute(key, val);
  }
  return element;
}

export function formValue(form: HTMLFormElement, name: string): string | undefined {
  const inputs = form.querySelectorAll<HTMLInputElement>('[name]');
  for (const input of inputs) {
    if (input.name === name) return input.value;
  }
}

const TEST_CONTAINER_ID = '__TEST_CONTAINER__';

function findContainer(): HTMLDivElement | null {
  return document.getElementById(TEST_CONTAINER_ID) as HTMLDivElement | null;
}

export function makeContainer(): HTMLDivElement {
  let container = findContainer();
  if (!container) {
    container = h('div', { id: TEST_CONTAINER_ID }) as HTMLDivElement;
    document.body.append(container);
  }
  return container;
}

export function removeContainer() {
  findContainer()?.remove();
}
