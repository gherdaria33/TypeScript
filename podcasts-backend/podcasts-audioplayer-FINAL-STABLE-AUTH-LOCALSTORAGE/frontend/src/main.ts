import './styles/global.css';
import './styles/app.css';
import './styles/auth.css';
import './styles/player.css';
import './styles/tracks.css';
import { Router } from './Router';

const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Root element not found');

new Router(root).start();