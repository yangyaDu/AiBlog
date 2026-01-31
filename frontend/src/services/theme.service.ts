
import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light' | 'matrix';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<Theme>('dark');

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-matrix');
    // Add new theme class
    if (theme !== 'dark') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }
}