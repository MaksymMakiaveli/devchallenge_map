import './styles.scss';
import { element, handle, WebComponent } from '../../shared';

@element({
  tagName: 'button-ui',
  shadow: true,
  template: `
    <button class="button-ui">
        <span>
            <slot></slot>
        </span>
    </button>
    `,
  styleUrl: './styles.scss',
})
export class Button extends WebComponent {
  @handle('click', '.btn')
  onClick() {
    console.log('Click');
  }
}
