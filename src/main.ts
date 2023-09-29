import './styles/main.scss';
import './app';
import './UI';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.createElement('app-component');

  document.querySelector('#app')?.appendChild(app);
});
