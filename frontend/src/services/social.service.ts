
import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private api = inject(ApiService);

  // --- Follows ---
  async follow(targetId: string) {
    // RESTful: POST /api/follows with Body { targetId }
    return this.api.post(`/api/follows`, { targetId });
  }

  async unfollow(targetId: string) {
    // DELETE /api/follows?targetId=...
    return this.api.delete(`/api/follows?targetId=${targetId}`);
  }

  async checkFollowStatus(targetId: string) {
    // GET /api/follows/check?targetId=...
    return this.api.get<{ isFollowing: boolean }>(`/api/follows/check?targetId=${targetId}`);
  }

  // --- Notifications ---
  async getNotifications() {
    return this.api.get<any[]>('/api/notifications');
  }

  // --- Likes ---
  async toggleLike(postId: string) {
    // RESTful: POST /api/likes with Body { postId }
    return this.api.post<{ status: 'liked' | 'unliked' }>(`/api/likes`, { postId });
  }

  // --- Comments ---
  async addComment(postId: string, content: string, parentId: string | null) {
     // RESTful: POST /api/comments with Body { postId, content, parentId }
     return this.api.post(`/api/comments`, { postId, content, parentId });
  }

  async deleteComment(commentId: string) {
      // DELETE /api/comments?id=...
      return this.api.delete(`/api/comments?id=${commentId}`);
  }

  async getMyComments(page: number = 1) {
      return this.api.get(`/api/comments/mine?page=${page}`);
  }

  // --- History ---
  async recordView(postId: string) {
      const session = localStorage.getItem('devfolio_session');
      if (!session) return; // Silent return for guest
      // RESTful: POST /api/history with Body { postId }
      return this.api.post(`/api/history`, { postId });
  }

  async getMyHistory(page: number = 1) {
      return this.api.get<any[]>(`/api/history/mine?page=${page}`);
  }
}
