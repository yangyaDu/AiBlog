
import { Component, input, inject, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { GeminiService } from '../services/gemini.service';
import { marked } from 'marked';
import Prism from 'prismjs';
import pangu from 'pangu';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
      
      <!-- Table of Contents (Sticky on Desktop) -->
      <aside class="hidden lg:block w-64 flex-shrink-0">
        <div class="sticky top-24 space-y-8">
          
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
          
          <!-- Mobile Summary Button -->
          <div class="lg:hidden mt-6">
             <button (click)="generateSummary()" [disabled]="isSummarizing() || summary()" class="flex items-center gap-2 text-brand-400 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                {{ summary() ? 'Summary Generated below' : (isSummarizing() ? 'Generating AI Summary...' : 'Generate AI Summary') }}
             </button>
             @if (summary()) {
                 <div class="mt-4 p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 markdown-summary" [innerHTML]="renderedSummary()"></div>
             }
          </div>
        </header>
        
        <div #contentRef class="markdown-body" [innerHTML]="renderedContent()"></div>
      </article>

    </div>
  `
})
export class BlogPostComponent implements AfterViewInit, OnDestroy {
  post = input.required<any>();
  langService = inject(LanguageService);
  geminiService = inject(GeminiService);
  t = this.langService.text;
  
  renderedContent = signal('');
  toc = signal<{id: string, text: string, level: number}[]>([]);
  activeHeader = signal<string>('');
  
  summary = signal<string>('');
  renderedSummary = signal<string>('');
  isSummarizing = signal(false);
  
  @ViewChild('contentRef') contentRef!: ElementRef;

  constructor() {}

  ngOnInit() {
    // Parse Markdown
    const rawMarkdown = this.post().content || '';
    this.renderedContent.set(marked.parse(rawMarkdown) as string);
  }

  ngAfterViewInit() {
    // 1. Syntax Highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(this.contentRef.nativeElement);
    }

    // 2. Pangu Spacing
    if (typeof pangu !== 'undefined') {
        (pangu as any).spacingElementByClassName('markdown-body');
    }

    // 3. Generate TOC
    this.generateTOC();

    // 4. Setup Scroll Listeners (Progress + Active Header)
    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    // Reset progress bar
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) progressBar.style.width = '0%';
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
    // Safety check
    if (!this.contentRef) return;
    
    const headers = this.contentRef.nativeElement.querySelectorAll('h2, h3');
    const tocData: {id: string, text: string, level: number}[] = [];
    
    headers.forEach((header: HTMLElement, index: number) => {
      // Generate ID if missing
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
    // Progress Bar
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    // Active Header
    if (!this.contentRef) return;
    const headers = this.contentRef.nativeElement.querySelectorAll('h2, h3');
    let currentId = '';
    
    headers.forEach((header: HTMLElement) => {
      const top = header.getBoundingClientRect().top;
      if (top < 150) { // Offset for header
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
