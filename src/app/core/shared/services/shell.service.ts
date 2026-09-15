import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShellService {
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly successSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this.errorSubject.asObservable();
  readonly success$ = this.successSubject.asObservable();

  get error(): string | null {
    return this.errorSubject.value;
  }

  get success(): string | null {
    return this.successSubject.value;
  }

  setError(message: string | null): void {
    this.errorSubject.next(message);
    if (message) this.successSubject.next(null);
  }

  setSuccess(message: string | null): void {
    this.successSubject.next(message);
    if (message) this.errorSubject.next(null);
  }
}
