export function elementBuilder(name: 'template', template: string): HTMLTemplateElement;
export function elementBuilder(name: string, template: string): HTMLElement {
  const element = document.createElement(name);

  element.innerHTML = template;

  return element;
}