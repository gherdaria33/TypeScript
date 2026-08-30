import './styles/global.css';

import { Header } from './view/components/Header';
import { Side } from './view/components/Side';
import { Router } from './Router';

const app =
  document.querySelector<HTMLDivElement>(
    '#app',
  );

if (!app) {
  throw new Error(
    'Элемент #app не найден в index.html',
  );
}

app.innerHTML = `
  <div class="app-shell">

    <div
      id="header-root"
      class="header-root"
    ></div>

    <div
      id="sidebar-root"
      class="sidebar-root"
    ></div>

    <main
      id="page-root"
      class="app-content"
    ></main>

  </div>
`;

const headerRoot =
  document.querySelector<HTMLElement>(
    '#header-root',
  );

const sidebarRoot =
  document.querySelector<HTMLElement>(
    '#sidebar-root',
  );

const pageRoot =
  document.querySelector<HTMLElement>(
    '#page-root',
  );

if (
  !headerRoot ||
  !sidebarRoot ||
  !pageRoot
) {
  throw new Error(
    'Не удалось создать элементы приложения.',
  );
}

const header =
  new Header(headerRoot);

const sidebar =
  new Side(sidebarRoot);

const router =
  new Router(pageRoot);

header.render();
sidebar.render();

void router.start();