import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Observable } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Pipe({ name: 'translate', standalone: true })
export class TranslatePipeReactive implements PipeTransform {
  constructor(private ts: TranslationService) {}
  transform(key: string): Observable<string> {
    return this.ts.lang$.pipe(
      // every time language changes, map to translation
      switchMap(lang => [ this.ts.translate(key) ]),
      startWith(this.ts.translate(key))
    );
  }
}
