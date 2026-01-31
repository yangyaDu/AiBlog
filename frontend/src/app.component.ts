
import { Component, signal, inject } from '@angular/core';
import { NavComponent } from './components/nav.component';
import { HeroComponent } from './components/hero.component';
import { ProjectsComponent } from './components/projects.component';
import { ChatComponent } from './components/chat.component';
import { BlogComponent } from './components/blog.component';
import { AboutComponent } from './components/about.component';
import { UsesComponent } from './components/uses.component';
import { AuthComponent } from './components/auth.component';
import { DashboardComponent } from './components/dashboard.component';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [NavComponent, HeroComponent, ProjectsComponent, ChatComponent, BlogComponent, AboutComponent, UsesComponent, AuthComponent, DashboardComponent],
  template: `
    <div class="min-h-screen bg-brand-darker text-slate-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300">
      <app-nav (navChange)="navigate($event)"></app-nav>
      
      <main class="pt-16">
        @switch (currentPage()) {
          @case ('home') {
            <app-hero></app-hero>
            <div id="projects-section">
              <app-projects></app-projects>
            </div>
            <!-- Simple Footer for Home -->
            <footer class="border-t border-white/5 py-12 bg-brand-dark transition-colors duration-300">
              <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-gray-400 mb-4">{{ t().footer.built }}</p>
                <div class="flex justify-center gap-6 text-gray-400">
                  <a href="#" class="hover:text-white transition-colors">GitHub</a>
                  <a href="#" class="hover:text-white transition-colors">LinkedIn</a>
                  <a href="#" class="hover:text-white transition-colors">Twitter</a>
                </div>
              </div>
            </footer>
          }
          @case ('projects') {
            <div class="pt-10">
              <app-projects></app-projects>
            </div>
          }
          @case ('blog') {
            <app-blog></app-blog>
          }
          @case ('about') {
            <app-about></app-about>
          }
          @case ('uses') {
            <app-uses></app-uses>
          }
          @case ('chat') {
            <app-chat></app-chat>
          }
          @case ('auth') {
            <app-auth (loginSuccess)="navigate('home')"></app-auth>
          }
          @case ('dashboard') {
            <app-dashboard></app-dashboard>
          }
        }
      </main>
    </div>
  `
})
export class AppComponent {
  currentPage = signal<string>('home');
  langService = inject(LanguageService);
  t = this.langService.text;

  navigate(page: string) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
