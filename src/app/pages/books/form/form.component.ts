// src/app/pages/books/form/form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BooksService } from '../books.service';     
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

  // model: include publishedDate (string yyyy-mm-dd for date input)
  model: Partial<Book & { publishedDate?: string }> = {
  title: '',
  author: '',
  publishedDate: undefined
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
    // Read the id param; if it exists => edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.titleKey = 'BOOK_FORM_EDIT';
      const id = Number(idParam);
      this.bookId = id;
      this.loadBook(id);
    } else {
      this.isEdit = false;
      // ensure model in add mode (published as yyyy-mm-dd for <input type="date">)
      this.model = { title: '', author: '', publishedDate: undefined };

    }
  }

  // When loading data from the backend, map the returned field to publishedDate
private loadBook(id: number): void {
  this.loading = true;
  this.booksService.getById(id).subscribe({
    next: (b: Book) => {
      this.model = {
        title: b.title,
        author: b.author,
        // If the backend returns publishedDate as an ISO string -> convert it to yyyy-mm-dd
        publishedDate: b.publishedDate ? this.toInputDate(b.publishedDate) : undefined
      };
      this.loading = false;
    },
    error: (err: any) => {
      this.error = err?.error?.message || 'Failed to load book';
      this.loading = false;
    }
  });
}

  // Helper to convert ISO -> yyyy-mm-dd (suitable for <input type="date">)
private toInputDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

  onSubmit(): void {
  // basic validation
  if (!this.model.title || !this.model.author) {
    this.error = 'Please fill title and author';
    return;
  }

  this.loading = true;
  this.error = null;

  // prepare payload: convert publishedDate (yyyy-mm-dd) -> ISO (or null)
  let publishedPayload: string | null = null;
  if (this.model.publishedDate) {
    // make sure we create a valid ISO date at start of day
    const d = new Date(this.model.publishedDate + 'T00:00:00');
    publishedPayload = isNaN(d.getTime()) ? null : d.toISOString();
  }

  const payload: any = {
    title: this.model.title,
    author: this.model.author,
    // send ISO string or null
    publishedDate: publishedPayload
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