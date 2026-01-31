
import { Component, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-uses',
  standalone: true,
  template: `
    <div class="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ t().uses.title }}</h2>
        <p class="text-gray-400 max-w-2xl mx-auto">{{ t().uses.subtitle }}</p>
      </div>

      <div class="space-y-12">
        <!-- Hardware -->
        <section>
          <h3 class="text-2xl font-bold text-brand-500 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            {{ t().uses.hardware }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (item of hardware; track item.name) {
              <div class="glass-panel p-6 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors">
                <h4 class="text-lg font-bold text-white mb-2">{{ item.name }}</h4>
                <p class="text-gray-400 text-sm">{{ item.desc }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Software -->
        <section>
          <h3 class="text-2xl font-bold text-brand-500 mb-6 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            {{ t().uses.software }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (item of software; track item.name) {
              <div class="glass-panel p-6 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors">
                <h4 class="text-lg font-bold text-white mb-2">{{ item.name }}</h4>
                <p class="text-gray-400 text-sm">{{ item.desc }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Tech Stack -->
        <section>
          <h3 class="text-2xl font-bold text-brand-500 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            {{ t().uses.stack }}
          </h3>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (item of stack; track item.name) {
              <div class="glass-panel p-6 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors">
                <h4 class="text-lg font-bold text-white mb-2">{{ item.name }}</h4>
                <p class="text-gray-400 text-sm">{{ item.desc }}</p>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `
})
export class UsesComponent {
  langService = inject(LanguageService);
  t = this.langService.text;

  hardware = [
    { name: 'MacBook Pro 16" M3 Max', desc: 'My daily driver for everything. The battery life is insane.' },
    { name: 'Keychron Q1 Pro', desc: 'Custom mechanical keyboard with Gateron Oil King switches.' },
    { name: 'LG 27" 4K Monitor', desc: 'Crisp display for reading documentation and code.' },
    { name: 'Sony WH-1000XM5', desc: 'Essential for deep work sessions with noise cancellation.' }
  ];

  software = [
    { name: 'VS Code', desc: 'With Catppuccin theme and GitHub Copilot.' },
    { name: 'Warp Terminal', desc: 'The terminal for the 21st century. Fast and intuitive.' },
    { name: 'Figma', desc: 'For designing UI components and layouts before coding.' },
    { name: 'Obsidian', desc: 'My second brain for taking notes and organizing thoughts.' }
  ];

  stack = [
    { name: 'Angular 18+', desc: 'My go-to framework for large scale applications.' },
    { name: 'Tailwind CSS', desc: 'Utility-first CSS framework for rapid UI development.' },
    { name: 'Google Gemini', desc: 'The LLM powering the AI features in my apps.' },
    { name: 'Node.js', desc: 'Server-side runtime for building scalable APIs.' }
  ];
}
