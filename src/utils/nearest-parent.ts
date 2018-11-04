import { parents } from './parents';

export function nearestParent(node: HTMLElement, selector: string): HTMLElement {
  return [...parents(node)].find(elem => {
    return elem.matches(selector);
  });
}