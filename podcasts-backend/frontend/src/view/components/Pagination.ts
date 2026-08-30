import { el, setChildren } from 'redom';

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export class Pagination {
  private readonly options: PaginationOptions;

  constructor(options: PaginationOptions) {
    this.options = options;
  }

  render(): HTMLElement {
    const pagination = el(
      'nav.pagination'
    );

    if (this.options.totalPages <= 1) {
      return pagination;
    }

    const previousButton = el(
      'button.pagination__button',
      '←'
    ) as HTMLButtonElement;

    previousButton.type = 'button';
    previousButton.disabled =
      this.options.currentPage === 1;

    previousButton.addEventListener('click', () => {
      if (this.options.currentPage > 1) {
        this.options.onChange(
          this.options.currentPage - 1
        );
      }
    });

    pagination.appendChild(
      previousButton
    );

    for (
      let page = 1;
      page <= this.options.totalPages;
      page += 1
    ) {
      const button = el(
        'button.pagination__button',
        String(page)
      ) as HTMLButtonElement;

      button.type = 'button';

      if (
        page === this.options.currentPage
      ) {
        button.classList.add(
          'pagination__button--active'
        );
      }

      button.addEventListener(
        'click',
        () => {
          this.options.onChange(page);
        }
      );

      pagination.appendChild(button);
    }

    const nextButton = el(
      'button.pagination__button',
      '→'
    ) as HTMLButtonElement;

    nextButton.type = 'button';

    nextButton.disabled =
      this.options.currentPage ===
      this.options.totalPages;

    nextButton.addEventListener('click', () => {
      if (
        this.options.currentPage <
        this.options.totalPages
      ) {
        this.options.onChange(
          this.options.currentPage + 1
        );
      }
    });

    pagination.appendChild(
      nextButton
    );

    return pagination;
  }
}