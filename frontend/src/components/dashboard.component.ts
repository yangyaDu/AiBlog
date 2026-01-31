
import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocialService } from '../services/social.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
       <div class="flex items-center gap-4 mb-10">
          <div class="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-3xl font-bold text-white">
             {{ authService.currentUser()?.username?.charAt(0)?.toUpperCase() }}
          </div>
          <div>
             <h2 class="text-3xl font-bold text-white">Welcome back, {{ authService.currentUser()?.username }}</h2>
             <p class="text-gray-400">Manage your activity and preferences</p>
          </div>
       </div>

       <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Notifications (New) -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-1">
             <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <i class="fa-solid fa-bell text-brand-500"></i> Notifications
             </h3>
             <div class="space-y-3 max-h-[400px] overflow-y-auto">
                @for (notif of notifications(); track notif.id) {
                   <div class="p-3 bg-white/5 rounded-lg border border-white/5 text-sm" [class.border-l-brand-500]="!notif.isRead" [class.border-l-4]="!notif.isRead">
                      <div class="flex justify-between mb-1">
                         <span class="font-bold text-white">{{ notif.senderName || 'Someone' }}</span>
                         <span class="text-xs text-gray-500">{{ notif.createdAt | date:'short' }}</span>
                      </div>
                      <p class="text-gray-300">
                        @switch (notif.type) {
                            @case ('comment_reply') { replied to your comment }
                            @case ('post_comment') { commented on your post }
                            @case ('post_like') { liked your post }
                            @case ('follow') { started following you }
                            @case ('post_new') { posted a new article }
                        }
                      </p>
                   </div>
                }
                @if (notifications().length === 0) {
                    <p class="text-gray-500 italic">No new notifications.</p>
                }
             </div>
          </div>

          <!-- Center Panel: History -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
             <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-brand-500"></i> Browsing History
             </h3>
             <div class="space-y-4">
                @for (item of history(); track $index) {
                   <div class="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 flex justify-between items-center">
                      <div>
                         <h4 class="font-bold text-brand-400">{{ item.postTitle }}</h4>
                         <p class="text-sm text-gray-400 line-clamp-1">{{ item.postExcerpt }}</p>
                      </div>
                      <span class="text-xs text-gray-500 flex-shrink-0 ml-4">{{ item.viewedAt | date:'short' }}</span>
                   </div>
                }
                @if (history().length === 0) {
                    <p class="text-gray-500 italic">No history yet.</p>
                }
             </div>
             <div class="mt-6 flex justify-center">
                 <button (click)="loadHistory(historyPage() + 1)" class="text-sm text-brand-500 hover:text-white">Load More</button>
             </div>
          </div>

       </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  socialService = inject(SocialService);
  authService = inject(AuthService);

  history = signal<any[]>([]);
  notifications = signal<any[]>([]);
  
  historyPage = signal(1);

  ngOnInit() {
      this.loadHistory(1);
      this.loadNotifications();
  }

  async loadHistory(page: number) {
      try {
          const data = await this.socialService.getMyHistory(page);
          if (page === 1) this.history.set(data);
          else this.history.update(h => [...h, ...data]);
          this.historyPage.set(page);
      } catch (e) {
          console.error("Failed to load history", e);
      }
  }

  async loadNotifications() {
      try {
          const data = await this.socialService.getNotifications();
          this.notifications.set(data);
      } catch (e) {
          console.error("Failed to load notifications", e);
      }
  }
}
