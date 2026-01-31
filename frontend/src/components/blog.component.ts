
import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { BlogPostComponent } from './blog-post.component';
import { DataService, BlogPost } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

declare const EasyMDE: any;

@Component({
  selector: 'app-blog',
  imports: [BlogPostComponent, FormsModule, DatePipe],
  template: `
    <!-- Blog Form Modal -->
    @if (showForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="glass-panel border border-white/10 p-8 rounded-2xl w-full max-w-5xl shadow-2xl max-h-[95vh] overflow-y-auto flex flex-col">
          <h2 class="text-2xl font-semibold text-white mb-6">{{ formMode === 'add' ? 'New Post' : 'Edit Post' }}</h2>
          <div class="space-y-4 flex-1 overflow-y-auto">
             <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Title</label>
                <input [(ngModel)]="currentForm.title" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none">
              </div>
             <div>
                <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Tags</label>
                <input [ngModel]="currentForm.tags ? currentForm.tags!.join(', ') : ''" (ngModelChange)="updateTags($event)" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Angular, Tech, Life">
              </div>
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Excerpt</label>
              <input [(ngModel)]="currentForm.excerpt" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none">
            </div>
            
            <div class="flex flex-col h-[500px]">
              <label class="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Content</label>
              <!-- EasyMDE Container -->
              <textarea #editorArea></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
            <button (click)="closeForm()" class="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button (click)="savePost()" class="px-6 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors">Save Article</button>
          </div>
        </div>
      </div>
    }

    @if (!selectedPost()) {
      <!-- List View -->
      <div class="py-32 max-w-5xl mx-auto px-6 animate-fade-in relative">
        <div class="mb-16 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 class="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">{{ t().blog.title }}</h2>
            <p class="text-gray-400 text-lg">{{ t().blog.subtitle }}</p>
          </div>
          <div class="flex flex-col items-end gap-4">
            @if (authService.currentUser()) {
                <button (click)="openAdd()" class="px-4 py-2 bg-white text-black rounded-full text-sm font-bold shadow-lg hover:bg-gray-200 transition-colors">
                + New Article
                </button>
            }
             <!-- Filter Tags -->
             <div class="flex flex-wrap gap-2">
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

        <div class="space-y-6 min-h-[400px]">
          @for (post of displayPosts(); track post.id) {
            <article class="relative bg-[#161617] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-300 group cursor-pointer hover:bg-[#1c1c1e]">
              
              <!-- Owner Controls -->
              @if (isOwner(post)) {
                 <div class="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="openEdit(post); $event.stopPropagation()" class="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button (click)="deletePost(post.id); $event.stopPropagation()" class="p-2 bg-red-500/20 rounded-full text-red-500 hover:bg-red-500/40">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                 </div>
              }

              <div (click)="viewPost(post)">
                <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                  <!-- Author Name -->
                   <span class="text-white bg-white/10 px-2 py-0.5 rounded">{{ post.authorName || 'Anonymous' }}</span>
                   <span class="w-1 h-1 rounded-full bg-gray-600"></span>
                   <!-- Date -->
                  <span class="text-brand-500">{{ post.createdAt | date:'mediumDate' }}</span>
                  <span class="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span>{{post.readTime}}</span>
                </div>
                
                <h3 class="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-brand-400 transition-colors tracking-tight">{{post.title}}</h3>
                <p class="text-gray-400 text-lg leading-relaxed mb-6">{{post.excerpt}}</p>
                
                 @if (post.tags) {
                  <div class="flex gap-2 mb-6">
                    @for (tag of post.tags; track tag) {
                      <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 group-hover:border-white/10 transition-colors">{{tag}}</span>
                    }
                  </div>
                }

                <div class="flex items-center text-sm font-semibold text-brand-500 group-hover:text-brand-400">
                  {{ t().blog.readMore }}
                  <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </article>
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
    } @else {
      <!-- Detail View -->
      <div class="relative">
        <!-- Back Button -->
        <div class="max-w-7xl mx-auto px-6 pt-8">
           <button (click)="selectedPost.set(null)" class="flex items-center text-gray-400 hover:text-white transition-colors group text-sm font-medium">
              <span class="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
              {{ t().blog.back }}
           </button>
        </div>
        
        <app-blog-post [post]="selectedPost()"></app-blog-post>
      </div>
    }
  `
})
export class BlogComponent {
  langService = inject(LanguageService);
  dataService = inject(DataService);
  authService = inject(AuthService);
  
  t = this.langService.text;
  
  // Data Selectors
  tags = this.dataService.getPostTags;

  // State
  selectedTag = signal<string | null>(null);
  page = signal(1);
  pageSize = 5;
  selectedPost = signal<BlogPost | null>(null);
  showForm = signal(false);
  formMode: 'add' | 'edit' = 'add';
  
  // Editor Instance
  easyMDE: any;
  @ViewChild('editorArea') editorArea!: ElementRef;
  
  // Computed Data
  filteredPosts = computed(() => {
    let posts = this.dataService.posts();
    if (this.selectedTag()) {
      posts = posts.filter(p => p.tags?.includes(this.selectedTag()!));
    }
    // Sort by timestamp desc (handle Date object or string)
    return posts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
    });
  });

  displayPosts = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPosts().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.filteredPosts().length / this.pageSize));

  // Form
  emptyPost: BlogPost = { 
      id: '', 
      title: '', 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      readTime: '5 min read', 
      excerpt: '', 
      content: '', 
      tags: [] 
  };
  currentForm: BlogPost = { ...this.emptyPost };

  // --- Auth Checks ---
  isOwner(p: BlogPost): boolean {
    const user = this.authService.currentUser();
    return !!user && (user.id === p.createdBy || user.username === 'admin');
  }

  // --- Actions ---

  setFilter(tag: string | null) {
    this.selectedTag.set(tag);
    this.page.set(1);
  }

  changePage(delta: number) {
    this.page.update(p => p + delta);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  viewPost(post: BlogPost) {
    this.selectedPost.set(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAdd() {
    this.formMode = 'add';
    const user = this.authService.currentUser();
    this.currentForm = { 
        ...this.emptyPost, 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(),
        createdBy: user ? user.id : 'anon',
        authorName: user ? user.username : 'Anonymous'
    };
    this.showForm.set(true);
    setTimeout(() => this.initEditor(), 100);
  }

  openEdit(post: BlogPost) {
    this.formMode = 'edit';
    this.currentForm = { ...post };
    this.showForm.set(true);
    setTimeout(() => this.initEditor(), 100);
  }

  closeForm() {
    this.showForm.set(false);
    if (this.easyMDE) {
        this.easyMDE.toTextArea();
        this.easyMDE = null;
    }
  }

  initEditor() {
      if (this.easyMDE) return;
      
      this.easyMDE = new EasyMDE({
          element: this.editorArea.nativeElement,
          initialValue: this.currentForm.content,
          theme: 'dark',
          placeholder: "Write something amazing...",
          spellChecker: false,
          toolbar: [
              "bold", "italic", "heading", "|", 
              "quote", "unordered-list", "ordered-list", "|",
              "link", "image", "code", "|",
              "preview", "side-by-side", "fullscreen", "|",
              {
                  name: "upload-image",
                  action: async (editor: any) => {
                      // Custom Image Upload logic
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          // 1. Convert to Base64 (Simulating Cloud Upload)
                          const base64 = await this.dataService.fileToDataURL(file);
                          
                          // 2. Call Backend to Encrypt/Hash the URL
                          const encryptedUrl = await this.dataService.encryptUrl(base64);
                          
                          // 3. Insert into editor
                          const cm = editor.codemirror;
                          const stat = editor.getState(cm);
                          const options = editor.options;
                          const url = encryptedUrl;
                          
                          const text = `![Image](${url})`;
                          cm.replaceSelection(text);
                      };
                      input.click();
                  },
                  className: "fa fa-upload",
                  title: "Upload Image",
              }
          ]
      });
      
      this.easyMDE.codemirror.on("change", () => {
         this.currentForm.content = this.easyMDE.value();
      });
  }

  deletePost(id: string) {
    if(confirm('Delete this article?')) {
      this.dataService.deletePost(id);
    }
  }

  savePost() {
    // Basic word count estimate for read time
    const words = this.currentForm.content.trim().split(/\s+/).length;
    this.currentForm.readTime = Math.ceil(words / 200) + ' min read';
    this.currentForm.updatedAt = new Date().toISOString();

    if (this.formMode === 'add') {
      this.dataService.addPost(this.currentForm);
    } else {
      this.dataService.updatePost(this.currentForm);
    }
    this.closeForm();
  }

  updateTags(val: string) {
    this.currentForm.tags = val.split(',').map(s => s.trim()).filter(s => !!s);
  }
}
