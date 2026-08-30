import { Header } from './view/components/Header';
import { Side } from './view/components/Side';

export class App {
  private root: HTMLElement;

  private headerRoot!: HTMLElement;
  private sidebarRoot!: HTMLElement;
  private contentRoot!: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(): void {
    this.root.innerHTML = `
      <div class="app-shell">

        <div id="app-header"></div>

        <div class="app-body">

          <div id="app-sidebar"></div>

          <main
            id="app-content"
            class="app-content"
          ></main>

        </div>

      </div>
    `;

    this.headerRoot =
      this.root.querySelector<HTMLElement>(
        '#app-header',
      )!;

    this.sidebarRoot =
      this.root.querySelector<HTMLElement>(
        '#app-sidebar',
      )!;

    this.contentRoot =
      this.root.querySelector<HTMLElement>(
        '#app-content',
      )!;

    const header =
      new Header(this.headerRoot);

    const sidebar =
      new Side(this.sidebarRoot);

    header.render();
    sidebar.render();
  }

  getContentRoot(): HTMLElement {
    return this.contentRoot;
  }

  refresh(): void {
    const header =
      new Header(this.headerRoot);

    const sidebar =
      new Side(this.sidebarRoot);

    header.render();
    sidebar.render();
  }
}