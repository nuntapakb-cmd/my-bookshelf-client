// src/app/pages/books/books.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../../models/book';

@Injectable({ providedIn: 'root' })
export class BooksService {
  
  private base = 'http://localhost:5014/api/Books';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.base);
  }

  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.base}/${id}`);
  }

  create(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.base, book);
  }

  update(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.base}/${id}`, book);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
