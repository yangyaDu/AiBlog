
import { Component, inject, output, signal } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { ThemeService, Theme } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [UpperCasePipe],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-brand-darker/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          
          <!-- Logo -->
          <div class="flex items-center gap-2 cursor-pointer" (click)="navigateTo('home')">
            <div class="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg">D</div>
            <span class="text-sm font-semibold tracking-wide text-white hidden sm:block">DevFolio</span>
          </div>
          
          <!-- Desktop Menu (Pill Style) -->
          <div class="hidden md:flex items-center bg-white/5 rounded-full px-1.5 py-1 border border-white/5">
              <button (click)="navigateTo('home')" class="text-gray-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10">{{ t().nav.home }}</button>
              <button (click)="navigateTo('projects')" class="text-gray-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10">{{ t().nav.projects }}</button>
              <button (click)="navigateTo('blog')" class="text-gray-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10">{{ t().nav.blog }}</button>
              <button (click)="navigateTo('about')" class="text-gray-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10">{{ t().nav.about }}</button>
              <button (click)="navigateTo('uses')" class="text-gray-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10">{{ t().nav.uses }}</button>
          </div>

          <!-- Settings & Actions -->
          <div class="flex items-center gap-3">
            
            <!-- Lang Switcher -->
            <button (click)="langService.toggleLang()" class="text-xs font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
              {{ langService.lang() }}
            </button>

            <!-- Ask AI Button (Gradient) -->
            <button (click)="navigateTo('chat')" class="group relative px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold transition-all hover:brightness-110">
              <span class="relative z-10 flex items-center gap-1">
                {{ t().nav.askAi }}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </button>

            <!-- Auth Avatar -->
            @if (authService.currentUser()) {
                <div class="relative group">
                  <button class="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white hover:border-white/30 transition-colors">
                     {{ authService.currentUser()?.username?.charAt(0)?.toUpperCase() }}
                  </button>
                  <div class="absolute right-0 top-full pt-2 hidden group-hover:block w-32">
                     <div class="glass-panel rounded-lg py-1">
                        <button (click)="navigateTo('dashboard')" class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 transition-colors">Dashboard</button>
                        <button (click)="authService.logout()" class="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors">Log out</button>
                     </div>
                  </div>
                </div>
            } @else {
               <button (click)="navigateTo('auth')" class="text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  Login
               </button>
            }
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button (click)="toggleMobileMenu()" class="text-gray-300 hover:text-white p-2">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (!mobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-brand-darker border-t border-white/5 animate-fade-in">
          <div class="px-4 py-4 space-y-2">
            <button (click)="navigateTo('home')" class="block w-full text-left px-4 py-3 rounded-lg bg-white/5 text-white text-sm font-medium">{{ t().nav.home }}</button>
            <button (click)="navigateTo('projects')" class="block w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white text-sm font-medium">{{ t().nav.projects }}</button>
            <button (click)="navigateTo('blog')" class="block w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white text-sm font-medium">{{ t().nav.blog }}</button>
            <button (click)="navigateTo('about')" class="block w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white text-sm font-medium">{{ t().nav.about }}</button>
            <button (click)="navigateTo('uses')" class="block w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white text-sm font-medium">{{ t().nav.uses }}</button>
            
            <div class="h-px bg-white/10 my-2"></div>
            
             @if (authService.currentUser()) {
                 <div class="px-4 py-2 text-xs text-gray-500 uppercase tracking-widest">Signed in as {{ authService.currentUser()?.username }}</div>
                 <button (click)="navigateTo('dashboard')" class="block w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 text-sm font-medium">Dashboard</button>
                 <button (click)="authService.logout(); toggleMobileMenu()" class="block w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-white/5 text-sm font-medium">Log out</button>
             } @else {
                 <button (click)="navigateTo('auth')" class="block w-full text-left px-4 py-3 rounded-lg text-white bg-brand-600 text-sm font-medium">Login</button>
             }
          </div>
        </div>
      }
    </nav>
  `
})
export class NavComponent {
  navChange = output<string>();
  mobileMenuOpen = signal(false);
  langService = inject(LanguageService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  t = this.langService.text;
  theme = this.themeService.currentTheme;

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  navigateTo(page: string) {
    this.navChange.emit(page);
    this.mobileMenuOpen.set(false);
  }

  setTheme(t: Theme) {
    this.themeService.setTheme(t);
  }
}
