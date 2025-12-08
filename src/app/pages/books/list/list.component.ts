// src/app/pages/books/list/list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Book } from '../../../models/book';
import { BooksService } from '../../books/books.service';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class BooksListComponent implements OnInit {
  books: Book[] = [];
  filtered: Book[] = [];
  loading = false;
  error: string | null = null;
  search = '';

  constructor(private booksService: BooksService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.booksService.getAll().subscribe({
      next: (res: Book[]) => {
        this.books = res || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = err?.error?.message || 'Failed to load books';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    const q = this.search?.trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.books];
    } else {
      this.filtered = this.books.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q)
      );
    }
  }

  onAdd() {
    this.router.navigate(['/books/new']);
  }

  onEdit(book: Book) {
    // guard: check that the id exists
    if (book.id == null) {
      console.error('onEdit: book has no id', book);
      alert('Cannot edit: book id missing');
      return;
    }
    this.router.navigate(['/books/edit', book.id]);
  }

  onDelete(book: Book) {
    // guard: check that the id exists
    if (book.id == null) {
      console.error('onDelete: book has no id', book);
      alert('Cannot delete: book id missing');
      return;
    }

    if (!confirm(`Delete "${book.title}" by ${book.author}?`)) return;

    const id = book.id;

    this.booksService.delete(id).subscribe({
      next: () => {
        this.books = this.books.filter(b => b.id !== id);
        this.applyFilter();
      },
      error: (err: any) => {
        console.error(err);
        alert('Delete failed: ' + (err?.error?.message || 'Unknown error'));
      }
    });
  }
}
