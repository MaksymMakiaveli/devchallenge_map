import { element, WebComponent } from '../shared';

@element({
  tagName: 'app-component',
  shadow: true,
  template: `
    <h2>HEllo</h2>
    <button-ui>HELLO BUTTON</button-ui>
  `,
})
export class App extends WebComponent {}

export default {};
