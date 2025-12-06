// src/app/pages/citat/citat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Citat } from '../../models/citat';

export interface CitatQuery {
  search?: string;
  author?: string;
  from?: string;   // yyyy-mm-dd
  to?: string;
  type?: 'short' | 'long' | 'all';
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class CitatService {

  private baseUrl = 'http://localhost:5014/api/Citat';

  constructor(private http: HttpClient) {}

  // ---------- Get all ----------
  getAll(query?: CitatQuery): Observable<Citat[]> {
    let params = new HttpParams();

    if (query) {
      if (query.search) params = params.set('search', query.search);
      if (query.author) params = params.set('author', query.author);
      if (query.from) params = params.set('from', query.from);
      if (query.to) params = params.set('to', query.to);
      if (query.type && query.type !== 'all') params = params.set('type', query.type);
      if (typeof query.mine === 'boolean') params = params.set('mine', String(query.mine));
      if (query.page) params = params.set('page', String(query.page));
      if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    }

    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map(arr => arr.map(item => this.normalize(item)))
    );
  }

  // ---------- Get by ID ----------
  getById(id: number): Observable<Citat> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(item => this.normalize(item))
    );
  }

  // ---------- Create ----------
  create(payload: Partial<Citat>): Observable<Citat> {
    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(item => this.normalize(item))
    );
  }

  // ---------- Update ----------
  update(id: number, payload: Partial<Citat>): Observable<Citat> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(item => this.normalize(item))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // -----------------------------------------------------
  // Normalize: ensure createdAt ALWAYS string (NOT Date)
  // -----------------------------------------------------
  private normalize(item: any): Citat {
    if (!item) return item;

    return {
      ...item,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString()
        : undefined
    } as Citat;
  }
}
