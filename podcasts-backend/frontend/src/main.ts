import './styles/global.css';
import './styles/header.css';
import './styles/sidebar.css';
import './styles/tracks.css';
import './styles/audio-player.css';
import './styles/auth.css';
import { Router } from './router/Router';
const root =
  document.querySelector<HTMLDivElement>(
    '#app',
  );
if (!root) {
  throw new Error(
    'Корневой элемент #app не найден',
  );
}
const router =
  new Router(root);
void router.start();