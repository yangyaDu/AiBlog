
import { EventEmitter } from "events";

// Define Event Types
export type AppEvents = {
  'post.created': { postId: string; authorId: string };
  'post.liked': { postId: string; userId: string };
  'comment.created': { commentId: string; postId: string; userId: string; parentId: string | null; content: string };
  'user.followed': { followerId: string; targetId: string };
};

class TypedEmitter extends EventEmitter {
  emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): boolean {
    return super.emit(event, payload);
  }

  on<K extends keyof AppEvents>(event: K, listener: (payload: AppEvents[K]) => void): this {
    return super.on(event, listener);
  }
}

export const EventBus = new TypedEmitter();
