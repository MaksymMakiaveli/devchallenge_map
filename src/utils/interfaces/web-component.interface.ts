export class WebComponent extends HTMLElement {
  constructor() {
    super();
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  static register(tagName: string) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, this);
    }
  }
}
