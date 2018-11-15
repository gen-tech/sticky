export function* parents(node: HTMLElement): Iterable<HTMLElement> {
  let current = node;

  while (current.parentElement) {
    yield current.parentElement;
    current = current.parentElement;
  }
}