
import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4">
      <div class="w-full max-w-2xl bg-brand-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[600px]">
        
        <!-- Header -->
        <div class="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M4 11v2a8 8 0 0 0 16 0v-2"/><path d="M12 19v2"/><path d="M8 22h8"/></svg>
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-dark"></div>
          </div>
          <div>
            <h3 class="font-bold text-white">{{ t().chat.header }}</h3>
            <p class="text-xs text-brand-500">{{ t().chat.powered }}</p>
          </div>
        </div>

        <!-- Chat Area -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4">
          @for (msg of messages(); track msg.id) {
            <div class="flex" [class.justify-end]="msg.role === 'user'">
              <div 
                class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                [class.bg-brand-500]="msg.role === 'user'"
                [class.text-white]="msg.role === 'user'"
                [class.bg-white/10]="msg.role === 'ai'"
                [class.text-gray-300]="msg.role === 'ai'"
                [class.rounded-tr-none]="msg.role === 'user'"
                [class.rounded-tl-none]="msg.role === 'ai'"
              >
                {{ msg.text }}
              </div>
            </div>
          }
          
          @if (isLoading()) {
            <div class="flex justify-start">
              <div class="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                <div class="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-white/10 bg-white/5">
          <form (submit)="sendMessage($event)" class="relative">
            <input 
              type="text" 
              [(ngModel)]="userInput" 
              name="userInput"
              [placeholder]="t().chat.placeholder" 
              class="w-full bg-brand-dark/50 text-white border border-white/10 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder-gray-500"
              [disabled]="isLoading()"
            >
            <button 
              type="submit"
              [disabled]="!userInput.trim() || isLoading()"
              class="absolute right-2 top-2 p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  `
})
export class ChatComponent implements AfterViewChecked {
  private geminiService = inject(GeminiService);
  private langService = inject(LanguageService);
  
  t = this.langService.text;
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  userInput = '';
  isLoading = signal(false);
  
  messages = signal<{id: number, role: 'user' | 'ai', text: string}[]>([]);

  constructor() {
    this.geminiService.initChat(
      "Alex", 
      ["Angular", "TypeScript", "Node.js", "Tailwind CSS", "Gemini API", "D3.js"], 
      ["Nebula Dashboard", "E-Commerce Microservices", "AI Code Assistant"]
    );
    
    effect(() => {
        // Reset/Update init message when lang changes if empty or just init
        const currentLang = this.langService.lang();
        if (this.messages().length === 0 || this.messages().length === 1) {
            this.messages.set([
                { id: 1, role: 'ai', text: this.t().chat.init }
            ]);
        }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.userInput.trim() || this.isLoading()) return;

    const text = this.userInput;
    this.userInput = '';
    
    // Add user message
    this.messages.update(msgs => [...msgs, { id: Date.now(), role: 'user', text }]);
    this.isLoading.set(true);

    // Get AI response
    const response = await this.geminiService.sendMessage(text, this.langService.lang());
    
    this.isLoading.set(false);
    this.messages.update(msgs => [...msgs, { id: Date.now() + 1, role: 'ai', text: response }]);
  }
}
