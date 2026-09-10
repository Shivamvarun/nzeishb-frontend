import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideMarkdown } from 'ngx-markdown';
import { provideAppHttp } from './core/http/http.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideMarkdown(),
    ...provideAppHttp()
  ]
};
