// src/app/models/book.ts
export interface Book {
  id?: number;
  title: string;
  author?: string;
  publishedDate?: string | null;
}
