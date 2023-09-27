import { WebComponent } from '../../utils';

export class Button extends WebComponent {
  static get observedAttributes() {
    return ['variant', 'label'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render = () => {
    console.log(this.innerText);

    const variant = this.getAttribute('variant') || 'primary';

    const baseClassName = 'ui-button';
    const className = `${this.className} ${baseClassName} ${baseClassName}--${variant}`;

    this.innerHTML = `
      <button class='${className}'>
          <span class='${baseClassName}-label'>${this.innerText}</span>
      </button>
      `;
  };
}
