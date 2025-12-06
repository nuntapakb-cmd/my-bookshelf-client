// src/app/pages/citat/citat.model.ts
export interface Citat {
  id?: number;
  text: string;
  author?: string;
  bookId?: number;
  createdAt?: string | Date;  
}
