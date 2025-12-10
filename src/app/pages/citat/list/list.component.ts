import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Citat } from '../../../models/citat';
import { Book } from '../../../models/book';
import { CitatService } from '../citat.service';         
import { BooksService } from '../../../core/services/books.service';



@Component({
  selector: 'app-citat-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CitatListComponent implements OnInit {
  quotes: Citat[] = [];
  filteredQuotes: Citat[] = [];

  // filters / UI state
  searchTerm = '';
  filterType: 'all' | 'short' | 'long' = 'all';
  filterAuthor: string = 'all';
  dateFrom: string = ''; // yyyy-mm-dd
  dateTo: string = '';   // yyyy-mm-dd

  authors: string[] = []; // unique authors for select

  // load books so we can extract authors from books too
  private books: { id?: number; title: string; author?: string }[] = [];

  loading = false;
  error: string | null = null;

  constructor(
    private citatService: CitatService,
    private booksService: BooksService, // <-- inject
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    // Load books and quotes in parallel
    // Load books first (so we can build authors from both)
    this.booksService.getAll().subscribe({
      next: (bks) => {
        this.books = bks || [];
        // then load quotes
        this.citatService.getAll().subscribe({
          next: (res) => {
            this.quotes = res || [];

            // DEBUG logs (temporary)
            console.log('Loaded quotes:', this.quotes);
            console.log('Loaded books:', this.books);

            this.buildAuthors();
            this.applyFilters(); // initialize filteredQuotes
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.error = err?.error?.message || 'Failed to load quotes';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load books', err);
        // still attempt to load quotes even if books failed
        this.books = [];
        this.citatService.getAll().subscribe({
          next: (res) => {
            this.quotes = res || [];
            console.log('Loaded quotes (no books):', this.quotes);
            this.buildAuthors();
            this.applyFilters();
            this.loading = false;
          },
          error: (err2) => {
            console.error(err2);
            this.error = err2?.error?.message || 'Failed to load quotes';
            this.loading = false;
          }
        });
      }
    });
  }

  /**
   * Build unique sorted author list (exclude null/empty)
   * - includes authors from quotes (q.author)
   * - includes authors from books (book.author)
   * - splits combined author strings like "John Katz & Frank Holmes" into separate names
   */
  private buildAuthors() {
    const raw: string[] = [];

    // 1) from quotes
    this.quotes.forEach(q => {
      if (q.author) raw.push(String(q.author));
      // also if quote references a nested book object with author (some responses may include)
      const anyQ = q as any;
      if (anyQ.book && anyQ.book.author) raw.push(String(anyQ.book.author));
    });

    // 2) from books list
    this.books.forEach(b => {
      if (b?.author) raw.push(String(b.author));
    });

    // Normalize & split combined authors
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

    const list = Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    this.authors = list;

    // DEBUG
    console.log('Authors found (raw):', raw);
    console.log('Authors final:', this.authors);
  }

  // apply all filters together
  applyFilters() {
    let result = [...this.quotes];

    // search term (text)
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(q => (q.text || '').toLowerCase().includes(term));
    }

    // type: short / long
    if (this.filterType === 'short') {
      result = result.filter(q => (q.text || '').length < 80);
    } else if (this.filterType === 'long') {
      result = result.filter(q => (q.text || '').length >= 80);
    }

    // author filter
    if (this.filterAuthor && this.filterAuthor !== 'all') {
      result = result.filter(q => {
        const qa = (q.author || '').trim();
        // also support fallback to book author if quote doesn't have an author
        let bookAuthor = '';
        const anyQ = q as any;
        if (anyQ.book && anyQ.book.author) bookAuthor = String(anyQ.book.author);
        return qa === this.filterAuthor || (bookAuthor.trim() === this.filterAuthor);
      });
    }

    // date range filter
    const from = this.parseDateStart(this.dateFrom);
    const to = this.parseDateEnd(this.dateTo);
    if (from || to) {
      result = result.filter(q => {
        if (!q.createdAt) return false;
        const d = new Date(q.createdAt).getTime();
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    // assign filtered list
    this.filteredQuotes = result;
  }

  // helper: parse yyyy-mm-dd to start of day timestamp or null
  private parseDateStart(dstr: string): number | null {
    if (!dstr) return null;
    const d = new Date(dstr + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // helper: parse yyyy-mm-dd to end of day timestamp or null
  private parseDateEnd(dstr: string): number | null {
    if (!dstr) return null;
    const d = new Date(dstr + 'T23:59:59.999');
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // reset all filters
  resetFilters() {
    this.searchTerm = '';
    this.filterType = 'all';
    this.filterAuthor = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  add() {
    this.router.navigate(['/citat/new']);
  }

  edit(q: Citat) {
    if (!q.id) return;
    this.router.navigate(['/citat/edit', q.id]);
  }

  remove(q: Citat) {
    if (!q.id) return;
    if (!confirm(`ลบคำพูด: "${(q.text || '').slice(0,60)}..." ?`)) return;
    this.citatService.delete(q.id).subscribe({
      next: () => this.load(),
      error: (err) => { console.error(err); alert('Delete failed'); }
    });
  }
}
