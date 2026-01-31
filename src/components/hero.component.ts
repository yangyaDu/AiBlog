
import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { LanguageService } from '../services/language.service';
import { DataService, ProfileData } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero',
  imports: [FormsModule],
  template: `
    <div class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 selection:bg-brand-500/30">
      
      <!-- Edit Mode Overlay -->
      @if (authService.currentUser() && isEditing()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div class="glass-panel p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in border border-white/10">
            <h2 class="text-2xl font-semibold text-white mb-6">Edit Profile</h2>
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Role</label>
                <input [(ngModel)]="editForm.role" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
              </div>
              <div class="grid grid-cols-3 gap-3">
                 <div>
                    <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Prefix</label>
                    <input [(ngModel)]="editForm.titlePrefix" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                 </div>
                 <div>
                    <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Highlight</label>
                    <input [(ngModel)]="editForm.titleHighlight" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                 </div>
                 <div>
                    <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Suffix</label>
                    <input [(ngModel)]="editForm.titleSuffix" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                 </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Intro</label>
                <textarea [(ngModel)]="editForm.intro" rows="3" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-8">
              <button (click)="isEditing.set(false)" class="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
              <button (click)="saveProfile()" class="px-6 py-2.5 text-sm font-medium bg-brand-500 text-white rounded-full hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      }

      <!-- Sophisticated Background Mesh (Apple Style) -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <!-- Main glow centered behind text -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
        <!-- Secondary accent glow -->
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[100px] opacity-30"></div>
        <!-- Bottom glow -->
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div class="max-w-5xl mx-auto px-6 text-center relative z-10 group/hero">
        
        <!-- Edit Button -->
        @if (authService.currentUser()) {
          <button (click)="editProfile()" class="absolute -top-12 right-0 p-2 text-gray-500 hover:text-white transition-colors opacity-0 group-hover/hero:opacity-100">
            <span class="text-xs font-medium tracking-wide border border-white/10 px-3 py-1 rounded-full bg-white/5 backdrop-blur">EDIT PROFILE</span>
          </button>
        }

        <!-- Role Pill -->
        <div class="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md animate-fade-in shadow-xl">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span class="text-gray-300 text-xs font-semibold tracking-widest uppercase">{{ profile().role }}</span>
        </div>

        <!-- Main Headline -->
        <h1 class="text-6xl md:text-8xl font-semibold text-white tracking-tighter mb-8 leading-[1.1] animate-slide-up">
          {{ profile().titlePrefix }} <br class="md:hidden" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-blue-400 to-brand-accent">{{ profile().titleHighlight }}</span>
          <br /> {{ profile().titleSuffix }}
        </h1>

        <p class="mt-2 max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 font-normal leading-relaxed mb-12 animate-slide-up" style="animation-delay: 0.1s">
          {{ profile().intro }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-up" style="animation-delay: 0.2s">
          <button (click)="scrollToProjects()" class="group relative px-8 py-3.5 rounded-full bg-white text-black font-medium text-lg hover:scale-105 transition-all duration-300">
            {{ t().hero.viewWork }}
            <div class="absolute inset-0 rounded-full bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          
          <button class="px-8 py-3.5 rounded-full text-white font-medium text-lg border border-white/20 hover:bg-white/5 hover:border-white/40 transition-all backdrop-blur-sm">
            {{ t().hero.resume }}
          </button>
        </div>

        <!-- Dynamic Tech Tip (Apple Notification Style) -->
        <div class="mt-20 mx-auto max-w-md animate-slide-up" style="animation-delay: 0.3s">
          <div class="glass-panel rounded-2xl p-5 border border-white/10 flex items-start gap-4 text-left hover:bg-white/5 transition-colors cursor-default">
             <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             </div>
             <div>
               <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{{ t().hero.techTipLabel }}</h3>
               <p class="text-sm text-gray-200 font-medium leading-relaxed">"{{ techTip() }}"</p>
             </div>
          </div>
        </div>

      </div>
      
      <!-- Bottom Fade -->
      <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-darker to-transparent pointer-events-none"></div>
    </div>
  `
})
export class HeroComponent implements OnInit {
  private geminiService = inject(GeminiService);
  private langService = inject(LanguageService);
  private dataService = inject(DataService);
  authService = inject(AuthService);
  
  t = this.langService.text;
  profile = this.dataService.profile;
  techTip = signal<string>("Initializing neural link...");
  
  isEditing = signal(false);
  editForm: ProfileData = { ...this.profile() };

  constructor() {
    effect(() => {
        this.loadTip();
    });
  }

  ngOnInit() {
    this.loadTip();
  }

  loadTip() {
    const lang = this.langService.lang();
    this.geminiService.generateTechTip(lang).then(tip => {
      this.techTip.set(tip);
    });
  }

  scrollToProjects() {
    const el = document.getElementById('projects-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  editProfile() {
    this.editForm = { ...this.profile() };
    this.isEditing.set(true);
  }

  saveProfile() {
    this.dataService.updateProfile(this.editForm);
    this.isEditing.set(false);
  }
}
