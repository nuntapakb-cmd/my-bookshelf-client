// src/app/pages/citat/form/form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// <-- ADDED imports: model + services
import { Citat } from '../citat.model';
import { CitatService } from '../citat.service';
import { BooksService } from '../../../core/services/books.service';


@Component({
  selector: 'app-citat-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class CitatFormComponent implements OnInit {
  model: Partial<Citat & { bookId?: number; author?: string }> = {
    text: '',
    bookId: undefined,
    author: ''
  };

  books: { id?: number; title: string; author?: string }[] = [];
  authors: string[] = []; // suggestions for datalist

  loading = false;
  saving = false;
  error: string | null = null;

  editId?: number;

  constructor(
    private citatService: CitatService,
    private booksService: BooksService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // load books for select and build authors list
    this.booksService.getAll().subscribe({
      next: (bks) => {
        this.books = bks || [];
        this.buildAuthorsFromBooks();
      },
      error: (err) => {
        console.error('Failed to load books', err);
        this.books = [];
      }
    });

    // check edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      this.loadQuote(this.editId);
    }
  }

  private loadQuote(id: number) {
    this.loading = true;
    this.citatService.getById(id).subscribe({
      next: (q: any) => {
        this.model = {
          text: q.text,
          bookId: q.bookId ?? q.book?.id,
          author: q.author ?? q.book?.author ?? ''
        };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load quote for edit';
        this.loading = false;
      }
    });
  }

  // when book select changes: prefill author (first author if multiple)
  onBookChange(bookId: number | string | undefined | null) {
    const id = typeof bookId === 'string' ? Number(bookId) : bookId;
    const found = this.books.find(b => b.id === id);
    if (found && found.author) {
      const first = this.splitAndPickFirst(found.author);
      this.model.author = first ?? found.author;
    }
  }

  private splitAndPickFirst(s: string): string | undefined {
    if (!s) return undefined;
    // split on common separators and return first meaningful token
    const parts = s.split(/\s*(?:&|\/|;|\|| and |,)\s*/i)
                   .map(p => p.replace(/\s+/g,' ').trim())
                   .filter(Boolean);
    return parts.length ? parts[0] : undefined;
  }

  private buildAuthorsFromBooks() {
    const raw: string[] = [];
    this.books.forEach(b => {
      if (b.author) raw.push(String(b.author));
    });

    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

    const splitAuthors = (s: string) => {
      if (!s) return [];
      const byAmp = s.split(/\s*(?:&|\/|;|\|| and )\s*/i).map(normalize).filter(Boolean);
      if (byAmp.length > 1) return byAmp;
      const commaCount = (s.match(/,/g) || []).length;
      if (commaCount >= 1) {
        return s.split(/\s*,\s*|\s+and\s+/i).map(normalize).filter(Boolean);
      }
      return [normalize(s)];
    };

    const map = new Map<string, string>();
    raw.forEach(r => {
      splitAuthors(r).forEach(a => {
        const n = normalize(a);
        if (!n) return;
        const key = n.toLowerCase();
        if (!map.has(key)) map.set(key, n);
      });
    });

    this.authors = Array.from(map.values()).sort((a,b) => a.localeCompare(b));
    console.log('Form authors:', this.authors);
  }

  cancel() {
    this.router.navigate(['/citat']);
  }

  save() {
    if (!this.model.text || this.model.text.trim() === '') {
      alert('Please enter the quote text.');
      return;
    }

    this.saving = true;
    const payload: any = {
      text: this.model.text.trim(),
      author: (this.model.author || '').trim() || undefined,
      bookId: this.model.bookId ?? undefined,
      createdAt: new Date().toISOString()
    };

    if (this.editId) {
      this.citatService.update(this.editId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/citat']);
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
          alert('Update failed');
        }
      });
    } else {
      this.citatService.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/citat']);
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
          alert('Save failed');
        }
      });
    }
  }
}
