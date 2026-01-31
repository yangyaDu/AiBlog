
import { Component, inject, signal, computed } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { DataService, Project } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  imports: [FormsModule],
  template: `
    <div class="py-32 bg-brand-darker relative">
      
       <!-- Project Form Modal (Using clean glass style) -->
       @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="glass-panel border border-white/10 p-8 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-semibold text-white mb-6">{{ formMode === 'add' ? 'New Project' : 'Edit Project' }}</h2>
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Title</label>
                <input [(ngModel)]="currentForm.title" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Description</label>
                <textarea [(ngModel)]="currentForm.description" rows="4" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none"></textarea>
              </div>
               <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Tags</label>
                <input [ngModel]="currentForm.tags.join(', ')" (ngModelChange)="updateTags($event)" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Image</label>
                <div class="flex gap-2">
                    <input type="file" (change)="handleFile($event)" class="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"/>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-8">
              <button (click)="showForm.set(false)" class="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button (click)="saveProject()" class="px-6 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors">Save Project</button>
            </div>
          </div>
        </div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16 md:flex justify-between items-end border-b border-white/10 pb-8">
          <div>
             <h2 class="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">{{ t().projects.title }}</h2>
             <p class="text-gray-400 max-w-xl text-lg">{{ t().projects.subtitle }}</p>
          </div>
          
          <div class="mt-6 md:mt-0 flex flex-col items-end gap-4">
            @if (authService.currentUser()) {
                <button (click)="openAdd()" class="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
                + Create Project
                </button>
            }
             <!-- Filter Tags -->
            <div class="flex flex-wrap justify-end gap-2">
                <button (click)="setFilter(null)" 
                [class.bg-white]="selectedTag() === null"
                [class.text-black]="selectedTag() === null"
                [class.bg-white-5]="selectedTag() !== null"
                [class.text-gray-400]="selectedTag() !== null"
                class="px-3 py-1 text-xs font-medium rounded-full border border-white/10 transition-colors">
                All
                </button>
                @for (tag of tags(); track tag) {
                <button (click)="setFilter(tag)" 
                    [class.bg-white]="selectedTag() === tag"
                    [class.text-black]="selectedTag() === tag"
                    [class.bg-white-5]="selectedTag() !== tag"
                    [class.text-gray-400]="selectedTag() !== tag"
                    class="px-3 py-1 text-xs font-medium rounded-full border border-white/10 transition-colors">
                    {{ tag }}
                </button>
                }
            </div>
          </div>
        </div>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of displayProjects(); track project.id) {
            <!-- Card -->
            <div class="group relative rounded-3xl overflow-hidden bg-[#161617] border border-white/5 hover:border-white/20 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
              
              <!-- Owner Controls -->
              @if (isOwner(project)) {
                <div class="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="openEdit(project)" class="p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button (click)="deleteProject(project.id)" class="p-2 bg-red-500/20 backdrop-blur rounded-full text-red-500 hover:bg-red-500/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              }

              <!-- Image Area -->
              <div class="aspect-[4/3] overflow-hidden bg-gray-900 relative">
                @if (project.image.startsWith('data:video')) {
                   <video [src]="project.image" controls class="w-full h-full object-cover"></video>
                } @else {
                   <img [src]="project.image" alt="Project Preview" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100">
                }
              </div>
              
              <!-- Content Area -->
              <div class="p-6">
                <div class="flex flex-wrap gap-2 mb-4">
                  @for (tag of project.tags; track tag) {
                    <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white/5 text-gray-300 border border-white/5">{{tag}}</span>
                  }
                </div>
                
                <h3 class="text-xl font-bold text-white mb-2 leading-tight">{{project.title}}</h3>
                <p class="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{{project.description}}</p>
                
                <div class="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
                  <a href="#" class="text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wide flex items-center gap-1 transition-colors">
                    {{ t().projects.viewCode }}
                  </a>
                  <a href="#" class="text-brand-500 hover:text-brand-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-1 transition-colors">
                    {{ t().projects.liveDemo }} <span class="text-lg">→</span>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center mt-16 gap-2">
             <button (click)="changePage(-1)" [disabled]="page() === 1" class="px-6 py-3 rounded-full bg-[#161617] border border-white/10 text-white disabled:opacity-30 hover:border-white/30 transition-all">←</button>
             <span class="px-6 py-3 rounded-full bg-[#161617] border border-white/10 text-gray-400 text-sm font-medium">{{ page() }} / {{ totalPages() }}</span>
             <button (click)="changePage(1)" [disabled]="page() === totalPages()" class="px-6 py-3 rounded-full bg-[#161617] border border-white/10 text-white disabled:opacity-30 hover:border-white/30 transition-all">→</button>
          </div>
        }
      </div>
    </div>
  `
})
export class ProjectsComponent {
  langService = inject(LanguageService);
  dataService = inject(DataService);
  authService = inject(AuthService);

  t = this.langService.text;
  
  // Data Selectors
  tags = this.dataService.getProjectTags;
  
  // State
  selectedTag = signal<string | null>(null);
  page = signal(1);
  pageSize = 6;
  showForm = signal(false);
  formMode: 'add' | 'edit' = 'add';
  
  // Computed Data for Display
  filteredProjects = computed(() => {
    let projs = this.dataService.projects();
    if (this.selectedTag()) {
      projs = projs.filter(p => p.tags.includes(this.selectedTag()!));
    }
    // Sort by date desc
    return projs.sort((a, b) => b.date - a.date);
  });

  displayProjects = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProjects().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.filteredProjects().length / this.pageSize));
  
  // Form State
  emptyProject: Project = { id: '', title: '', description: '', tags: [], image: '', date: 0 };
  currentForm: Project = { ...this.emptyProject };

  // --- Auth Checks ---
  isOwner(p: Project): boolean {
    const user = this.authService.currentUser();
    return !!user && (user.id === p.authorId || p.authorId === 'admin'); // Assuming initial admin content is editable by anyone or just admin logic
  }

  // --- Actions ---

  setFilter(tag: string | null) {
    this.selectedTag.set(tag);
    this.page.set(1); // Reset page on filter change
  }

  changePage(delta: number) {
    this.page.update(p => p + delta);
    window.scrollTo({top: 0, behavior: 'smooth'}); // Optional scroll to top
  }

  openAdd() {
    this.formMode = 'add';
    const user = this.authService.currentUser();
    this.currentForm = { 
      ...this.emptyProject, 
      id: Date.now().toString(), 
      date: Date.now(),
      authorId: user ? user.id : 'anon'
    };
    this.showForm.set(true);
  }

  openEdit(p: Project) {
    this.formMode = 'edit';
    this.currentForm = { ...p };
    this.showForm.set(true);
  }

  deleteProject(id: string) {
    if(confirm('Are you sure you want to delete this project?')) {
      this.dataService.deleteProject(id);
    }
  }

  saveProject() {
    if (this.formMode === 'add') {
      this.dataService.addProject(this.currentForm);
    } else {
      this.dataService.updateProject(this.currentForm);
    }
    this.showForm.set(false);
  }

  updateTags(val: string) {
    this.currentForm.tags = val.split(',').map(s => s.trim()).filter(s => !!s);
  }

  async handleFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const base64 = await this.dataService.fileToDataURL(file);
      this.currentForm.image = base64;
    }
  }
}
