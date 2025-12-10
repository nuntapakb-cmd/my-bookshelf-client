// src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Book } from '../../models/book';
import { BooksService } from '../../core/services/books.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  recentBooks: Book[] = [];
  loading = false;
  errorMessage: string | null = null;
  greetingName: string | null = null;

  readonly maxRecent = 5;

  constructor(
    private booksService: BooksService,
    public auth: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.greetingName = this.auth.user?.username ?? null;
    this.loadRecentBooks();
  }

  loadRecentBooks(): void {
    this.loading = true;
    this.errorMessage = null;

    this.booksService.getAll().subscribe({
      next: (books: Book[]) => {
        this.recentBooks = books
          .slice()
          .sort((a: Book, b: Book) => {
            const da = a.publishedDate ? new Date(a.publishedDate as string ).getTime() : (a.id ?? 0);
            const db = b.publishedDate ? new Date(b.publishedDate as string ).getTime() : (b.id ?? 0);
            return db - da;
          })
          .slice(0, this.maxRecent);

        this.loading = false;
      },

      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'ERROR_LOAD_BOOKS';
        this.loading = false;
      }
    });
  }

  goToAddBook(): void {
    this.router.navigate(['/books/new']);
  }

  goToBooksList(): void {
    this.router.navigate(['/books']);
  }

  goToQuotes(): void {
    this.router.navigate(['/citat']);
  }

  editBook(id?: number): void {
    if (id == null) return;
    this.router.navigate(['/books/edit', id]);
  }

  deleteBook(id?: number): void {
    if (id == null) return;

    const confirmText = this.translate.instant('CONFIRM_DELETE_BOOK');
    if (!confirm(confirmText)) return;

    this.booksService.delete(id).subscribe({
      next: () => {
        this.recentBooks = this.recentBooks.filter(b => b.id !== id);
        this.loadRecentBooks();
      },
      error: (err: any) => {
        console.error(err);

        const errorText = this.translate.instant('ERROR_DELETE_BOOK');
        alert(errorText);
      }
    });
  }
}
