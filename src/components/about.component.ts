
import { Component, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div class="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-dark/50">
        <h2 class="text-3xl font-bold text-white mb-6">{{ t().about.title }}</h2>
        
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="w-full md:w-1/3">
             <div class="aspect-square rounded-xl overflow-hidden border-2 border-brand-500/20 shadow-xl relative group">
                <img src="https://picsum.photos/400/400?random=10" alt="Profile" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-brand-darker/80 to-transparent"></div>
             </div>
          </div>
          
          <div class="w-full md:w-2/3">
             <p class="text-xl text-brand-500 font-medium mb-4">{{ t().about.description }}</p>
             <p class="text-gray-300 leading-relaxed mb-6">{{ t().about.content }}</p>
             
             <div class="grid grid-cols-2 gap-4 mt-8">
               <div class="p-4 bg-white/5 rounded-lg border border-white/5">
                 <h3 class="text-sm font-bold text-white mb-1">Location</h3>
                 <p class="text-gray-400">San Francisco, CA</p>
               </div>
               <div class="p-4 bg-white/5 rounded-lg border border-white/5">
                 <h3 class="text-sm font-bold text-white mb-1">Experience</h3>
                 <p class="text-gray-400">5+ Years</p>
               </div>
               <div class="p-4 bg-white/5 rounded-lg border border-white/5">
                 <h3 class="text-sm font-bold text-white mb-1">Availability</h3>
                 <p class="text-green-400">Open to offers</p>
               </div>
               <div class="p-4 bg-white/5 rounded-lg border border-white/5">
                 <h3 class="text-sm font-bold text-white mb-1">Email</h3>
                 <p class="text-gray-400">alex@example.com</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {
  langService = inject(LanguageService);
  t = this.langService.text;
}
