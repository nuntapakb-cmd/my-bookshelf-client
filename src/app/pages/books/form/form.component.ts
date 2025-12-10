// src/app/pages/books/form/form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BooksService } from '../../../core/services/books.service';
import { Book } from '../../../models/book';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class BookFormComponent implements OnInit {

  titleKey = 'BOOK_FORM_ADD';

  // The form uses `publishedAt` as a string in the format `yyyy-MM-dd`
  model: Partial<Book> = {
    title: '',
    author: '',
    publishedAt: null
  };

  isEdit = false;
  loading = false;
  error: string | null = null;
  private bookId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.titleKey = 'BOOK_FORM_EDIT';
      const id = Number(idParam);
      this.bookId = id;
      this.loadBook(id);
    } else {
      this.isEdit = false;
      this.model = { title: '', author: '', publishedAt: null };
    }
  }

  // Load data from backend → Convert publishedAt (ISO string) to yyyy-MM-dd for input type="date"
  private loadBook(id: number): void {
    this.loading = true;
    this.booksService.getById(id).subscribe({
      next: (b: Book) => {
        let inputDate: string | null = null;

        if (b.publishedAt) {
          
          const iso = String(b.publishedAt); // Supports both '2025-12-10' and '2025-12-10T00:00:00.000Z'
          inputDate = iso.slice(0, 10);      // format:yyyy-MM-dd
        }

        this.model = {
          title: b.title,
          author: b.author,
          publishedAt: inputDate
        };

        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load book';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.model.title || !this.model.author) {
      this.error = 'Please fill title and author';
      return;
    }

    this.loading = true;
    this.error = null;

    // Send the string directly to the backend (without converting it to Date/UTC)
    const payload: Book = {
      title: this.model.title!,
      author: this.model.author || '',
      publishedAt: this.model.publishedAt ?? null
    };

    if (this.isEdit && this.bookId != null) {
      this.booksService.update(this.bookId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/books']);
        },
        error: (err: any) => {
          console.error('Update book failed', err);
          this.error = err?.error?.message || 'Update failed';
          this.loading = false;
        }
      });
    } else {
      this.booksService.create(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/books']);
        },
        error: (err: any) => {
          console.error('Create book failed', err);
          this.error = err?.error?.message || 'Create failed';
          this.loading = false;
        }
      });
    }
  }
}
