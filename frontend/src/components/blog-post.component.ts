
import { Component, input, inject, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { GeminiService } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';
import { DataService, Comment } from '../services/data.service';
import { marked } from 'marked';
import Prism from 'prismjs';
import pangu from 'pangu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
      
      <!-- Table of Contents (Sticky on Desktop) -->
      <aside class="hidden lg:block w-64 flex-shrink-0">
        <div class="sticky top-24 space-y-8">
          
          <!-- Interaction Widget -->
           <div class="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between">
              <button (click)="toggleLike()" [disabled]="!authService.currentUser()" class="flex items-center gap-2 text-sm font-bold transition-colors" [class.text-red-500]="userLiked()" [class.text-gray-400]="!userLiked()">
                 <i class="fa-solid fa-heart"></i>
                 {{ likesCount() }}
              </button>
              <div class="flex items-center gap-2 text-sm font-bold text-gray-400">
                 <i class="fa-solid fa-comment"></i>
                 {{ comments().length }}
              </div>
           </div>

          <!-- AI Summary Widget -->
          <div class="glass-panel p-5 rounded-xl border border-brand-500/20 bg-gradient-to-b from-brand-500/5 to-transparent">
             <div class="flex items-center gap-2 mb-3 text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <h4 class="text-xs font-bold uppercase tracking-wider">AI Summary</h4>
             </div>
             
             @if (!summary()) {
                <button (click)="generateSummary()" [disabled]="isSummarizing()" class="w-full py-2 px-4 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs font-bold transition-colors disabled:opacity-50">
                    {{ isSummarizing() ? (t().chat.thinking) : 'Summarize Article' }}
                </button>
             } @else {
                <div class="text-sm text-gray-300 leading-relaxed space-y-2 animate-fade-in markdown-summary" [innerHTML]="renderedSummary()"></div>
             }
          </div>

          <div>
            <h4 class="text-sm font-bold text-brand-500 uppercase tracking-wider mb-4">{{ t().blog.toc }}</h4>
            <nav class="space-y-1 border-l border-white/10">
              @for (header of toc(); track header.id) {
                <a 
                  [href]="'#' + header.id" 
                  (click)="scrollToHeader($event, header.id)"
                  class="block pl-4 py-1 text-sm text-gray-400 hover:text-white hover:border-l hover:border-brand-500 -ml-px transition-all"
                  [class.text-brand-400]="activeHeader() === header.id"
                  [class.border-brand-500]="activeHeader() === header.id"
                  [class.bg-white-5]="activeHeader() === header.id"
                  [style.padding-left.rem]="header.level === 3 ? 2 : 1"
                >
                  {{ header.text }}
                </a>
              }
            </nav>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <article class="flex-1 min-w-0 animate-fade-in">
        <header class="mb-10 border-b border-white/10 pb-10">
          <div class="flex items-center gap-4 text-sm text-brand-500 mb-4">
             <span class="text-white bg-white/10 px-2 py-0.5 rounded">{{ post().authorName || 'Anonymous' }}</span>
             <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
             <span>{{ post().createdAt | date:'mediumDate' }}</span>
             <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
             <span>{{ post().readTime }}</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{{ post().title }}</h1>
          <div class="flex flex-wrap gap-2">
             @for (tag of post().tags || ['Tech']; track tag) {
               <span class="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs text-gray-400">{{tag}}</span>
             }
          </div>
        </header>
        
        <div #contentRef class="markdown-body" [innerHTML]="renderedContent()"></div>
        
        <!-- Comments Section -->
        <div class="mt-20 border-t border-white/10 pt-10">
            <h3 class="text-2xl font-bold text-white mb-8">Comments ({{ comments().length }})</h3>
            
            @if (authService.currentUser()) {
                <div class="mb-10">
                    <textarea [(ngModel)]="newCommentContent" class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-500 transition-colors" rows="3" placeholder="Join the discussion..."></textarea>
                    <div class="flex justify-end mt-2">
                        <button (click)="submitComment()" [disabled]="!newCommentContent" class="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50">Post Comment</button>
                    </div>
                </div>
            } @else {
                <div class="p-4 bg-white/5 rounded-xl text-center text-gray-400 mb-10">
                    Please <span class="text-brand-500 cursor-pointer">Login</span> to comment.
                </div>
            }

            <div class="space-y-6">
                @for (comment of rootComments(); track comment.id) {
                    <div class="group">
                        <div class="flex gap-4">
                            <div class="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 font-bold">
                                {{ comment.username.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-white font-bold">{{ comment.username }}</span>
                                    <span class="text-gray-500 text-xs">{{ comment.createdAt | date:'medium' }}</span>
                                    @if (authService.currentUser()?.id === comment.userId) {
                                        <button (click)="deleteComment(comment.id)" class="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-auto">Delete</button>
                                    }
                                </div>
                                <p class="text-gray-300 text-sm leading-relaxed">{{ comment.content }}</p>
                                
                                <div class="mt-2">
                                    <button (click)="replyTo(comment.id)" class="text-brand-500 text-xs font-bold hover:underline">Reply</button>
                                </div>

                                <!-- Reply Form -->
                                @if (replyingTo() === comment.id) {
                                    <div class="mt-4 pl-4 border-l-2 border-white/10">
                                        <textarea [(ngModel)]="replyContent" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none text-sm" rows="2" placeholder="Write a reply..."></textarea>
                                        <div class="flex justify-end gap-2 mt-2">
                                            <button (click)="replyingTo.set(null)" class="text-gray-400 text-xs">Cancel</button>
                                            <button (click)="submitReply(comment.id)" class="px-4 py-1 bg-brand-500 text-white rounded text-xs font-bold">Reply</button>
                                        </div>
                                    </div>
                                }
                                
                                <!-- Children -->
                                @if (comment.children && comment.children.length > 0) {
                                    <div class="mt-4 pl-4 border-l-2 border-white/10 space-y-4">
                                        @for (child of comment.children; track child.id) {
                                            <div class="flex gap-3 group/child">
                                                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-xs font-bold">
                                                    {{ child.username.charAt(0).toUpperCase() }}
                                                </div>
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <span class="text-white text-sm font-bold">{{ child.username }}</span>
                                                        <span class="text-gray-500 text-xs">{{ child.createdAt | date:'medium' }}</span>
                                                         @if (authService.currentUser()?.id === child.userId) {
                                                            <button (click)="deleteComment(child.id)" class="text-red-500 text-xs opacity-0 group-hover/child:opacity-100 transition-opacity ml-auto">Delete</button>
                                                        }
                                                    </div>
                                                    <p class="text-gray-400 text-sm">{{ child.content }}</p>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>

      </article>

    </div>
  `
})
export class BlogPostComponent implements AfterViewInit, OnDestroy {
  post = input.required<any>();
  langService = inject(LanguageService);
  geminiService = inject(GeminiService);
  authService = inject(AuthService);
  dataService = inject(DataService);

  t = this.langService.text;
  
  renderedContent = signal('');
  toc = signal<{id: string, text: string, level: number}[]>([]);
  activeHeader = signal<string>('');
  
  summary = signal<string>('');
  renderedSummary = signal<string>('');
  isSummarizing = signal(false);
  
  // Interactions
  likesCount = signal(0);
  userLiked = signal(false);
  comments = signal<Comment[]>([]);
  rootComments = computed(() => {
      const all = this.comments();
      const map = new Map<string, Comment>();
      all.forEach(c => {
          c.children = [];
          map.set(c.id, c);
      });
      const roots: Comment[] = [];
      all.forEach(c => {
          if (c.parentId) {
              const parent = map.get(c.parentId);
              if (parent) parent.children?.push(c);
          } else {
              roots.push(c);
          }
      });
      return roots;
  });

  newCommentContent = '';
  replyingTo = signal<string | null>(null);
  replyContent = '';

  @ViewChild('contentRef') contentRef!: ElementRef;

  constructor() {}

  ngOnInit() {
    this.processContent();
    this.loadInteractions();
  }

  processContent() {
    let rawMarkdown = this.post().content || '';
    
    // Decrypt URLs locally (Simulation of "Frontend handles the encrypted url")
    // In our backend controller, we prefixed secure urls with "SECURE::" and base64 encoded them.
    // Regex to find ![alt](SECURE::...)
    rawMarkdown = rawMarkdown.replace(/!\[(.*?)\]\(SECURE::(.*?)\)/g, (match, alt, hash) => {
        try {
            const url = atob(hash);
            return `![${alt}](${url})`;
        } catch {
            return match;
        }
    });

    this.renderedContent.set(marked.parse(rawMarkdown) as string);
  }

  ngAfterViewInit() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(this.contentRef.nativeElement);
    }
    if (typeof pangu !== 'undefined') {
        (pangu as any).spacingElementByClassName('markdown-body');
    }
    this.generateTOC();
    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) progressBar.style.width = '0%';
  }

  async loadInteractions() {
     // Mock fetch for now, replace with http call in real app
     try {
        const token = localStorage.getItem('devfolio_session') ? JSON.parse(localStorage.getItem('devfolio_session')!).token : '';
        const res = await fetch(`/api/posts/${this.post().id}/interactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.code === 0) {
                this.likesCount.set(data.data.likes);
                this.userLiked.set(data.data.userLiked);
                this.comments.set(data.data.comments);
            }
        }
     } catch (e) { console.error(e); }
  }

  async toggleLike() {
      try {
        const token = JSON.parse(localStorage.getItem('devfolio_session')!).token;
        const res = await fetch(`/api/posts/${this.post().id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.code === 0) {
            if (data.data.status === 'liked') {
                this.likesCount.update(n => n + 1);
                this.userLiked.set(true);
            } else {
                this.likesCount.update(n => n - 1);
                this.userLiked.set(false);
            }
        }
      } catch(e) { console.error(e); }
  }

  async submitComment() {
      await this.postComment(this.newCommentContent, null);
      this.newCommentContent = '';
  }

  replyTo(commentId: string) {
      this.replyingTo.set(commentId);
      this.replyContent = '';
  }

  async submitReply(parentId: string) {
      await this.postComment(this.replyContent, parentId);
      this.replyingTo.set(null);
  }

  async postComment(content: string, parentId: string | null) {
      try {
        const token = JSON.parse(localStorage.getItem('devfolio_session')!).token;
        const res = await fetch(`/api/posts/${this.post().id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content, parentId })
        });
        const data = await res.json();
        if (data.code === 0) {
            // Optimistically add
            const newC: Comment = {
                ...data.data,
                username: this.authService.currentUser()!.username,
                createdAt: new Date().toISOString()
            };
            this.comments.update(c => [newC, ...c]);
        }
      } catch(e) { console.error(e); }
  }

  async deleteComment(id: string) {
      if (!confirm('Delete this comment?')) return;
      try {
         const token = JSON.parse(localStorage.getItem('devfolio_session')!).token;
         await fetch(`/api/posts/comments/${id}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${token}` }
         });
         this.comments.update(c => c.filter(x => x.id !== id));
      } catch(e) {}
  }

  async generateSummary() {
      if (this.isSummarizing()) return;
      this.isSummarizing.set(true);
      
      const result = await this.geminiService.summarizeArticle(this.post().content, this.langService.lang());
      this.summary.set(result);
      this.renderedSummary.set(marked.parse(result) as string);
      
      this.isSummarizing.set(false);
  }

  generateTOC() {
    if (!this.contentRef) return;
    
    const headers = this.contentRef.nativeElement.querySelectorAll('h2, h3');
    const tocData: {id: string, text: string, level: number}[] = [];
    
    headers.forEach((header: HTMLElement, index: number) => {
      if (!header.id) {
        header.id = 'header-' + index;
      }
      tocData.push({
        id: header.id,
        text: header.textContent || '',
        level: parseInt(header.tagName.substring(1))
      });
    });
    
    this.toc.set(tocData);
  }

  onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (!this.contentRef) return;
    const headers = this.contentRef.nativeElement.querySelectorAll('h2, h3');
    let currentId = '';
    
    headers.forEach((header: HTMLElement) => {
      const top = header.getBoundingClientRect().top;
      if (top < 150) { 
        currentId = header.id;
      }
    });
    
    if (currentId) {
      this.activeHeader.set(currentId);
    }
  }

  scrollToHeader(e: Event, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
       const y = el.getBoundingClientRect().top + window.scrollY - 100; // Offset
       window.scrollTo({top: y, behavior: 'smooth'});
    }
  }
}
