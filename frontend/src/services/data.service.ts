
import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Project {
  id: string;
  authorId?: string; // Owner ID
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
  date: number; // For sorting
}

export interface BlogPost {
  id: string;
  
  // Content
  title: string;
  excerpt: string;
  content: string; // Markdown
  readTime: string;
  coverImage?: string;
  tags?: string[];
  
  // Audit
  createdBy?: string; 
  authorName?: string; // Resolved name from backend
  
  // Timestamps (Strings from API JSON)
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  userId: string;
  username: string;
  content: string;
  createdAt: string | Date;
  children?: Comment[]; // For UI tree
}

export interface ProfileData {
  role: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  intro: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private api = inject(ApiService);
  
  // Initial default data
  private defaultProfile: ProfileData = {
    role: 'Frontend & Full Stack Engineer',
    titlePrefix: 'Building the',
    titleHighlight: 'Future',
    titleSuffix: 'One Line at a Time.',
    intro: "Hi, I'm Alex. I craft robust web applications and interactive experiences."
  };

  private defaultProjects: Project[] = [
    {
      id: '1',
      authorId: 'admin',
      title: "Nebula Dashboard",
      description: "A real-time analytics dashboard for cloud infrastructure monitoring. Built with Angular Signals and D3.js for high-performance data visualization.",
      tags: ["Angular", "D3.js", "Tailwind"],
      image: "https://picsum.photos/600/400?random=1",
      date: Date.now()
    }
  ];

  private defaultPosts: BlogPost[] = [
    {
      id: '1',
      createdBy: 'admin',
      authorName: 'Alex',
      title: "Optimizing Angular Change Detection with Signals",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTime: "5 min read",
      excerpt: "Why Zoneless Angular is the future and how to migrate your existing RxJS based state management to fine-grained Signals.",
      tags: ["Angular", "Performance"],
      content: `
Zoneless Angular is finally here! With the release of Angular 18, we can now build applications without \`zone.js\`. This article explores the benefits and how to implement it using Signals.

## Why Zoneless?

Zone.js has been the magic behind Angular's change detection for years. However, it comes with a cost:
1. **Bundle Size**: It's not huge, but every kilobyte counts.
2. **Performance**: It monkey-patches async APIs, which can add overhead.

## The Signal Revolution

Signals provide a reactive primitive that Angular can use to know *exactly* what changed and where.
      `
    }
  ];

  // Signals (Source of Truth)
  profile = signal<ProfileData>(this.defaultProfile);
  projects = signal<Project[]>(this.defaultProjects);
  posts = signal<BlogPost[]>(this.defaultPosts);

  constructor() {
    this.loadFromStorage();
    
    // Auto-save effects
    effect(() => {
      localStorage.setItem('devfolio_profile', JSON.stringify(this.profile()));
    });
    effect(() => {
      localStorage.setItem('devfolio_projects', JSON.stringify(this.projects()));
    });
    effect(() => {
      localStorage.setItem('devfolio_posts', JSON.stringify(this.posts()));
    });
  }

  private loadFromStorage() {
    const storedProfile = localStorage.getItem('devfolio_profile');
    const storedProjects = localStorage.getItem('devfolio_projects');
    const storedPosts = localStorage.getItem('devfolio_posts');

    if (storedProfile) this.profile.set(JSON.parse(storedProfile));
    if (storedProjects) this.projects.set(JSON.parse(storedProjects));
    if (storedPosts) this.posts.set(JSON.parse(storedPosts));
  }

  // --- API Integrations ---
  
  async encryptUrl(url: string): Promise<string> {
      try {
        const res = await this.api.post<{ encryptedUrl: string }>('/api/media/encrypt-url', { url });
        return res.encryptedUrl;
      } catch(e) {
          console.error(e);
          return url; // Fallback
      }
  }

  // --- Profile Actions ---
  updateProfile(data: ProfileData) {
    this.profile.set(data);
  }

  // --- Project Actions ---
  addProject(project: Project) {
    this.projects.update(p => [project, ...p]);
  }

  updateProject(project: Project) {
    this.projects.update(p => p.map(x => x.id === project.id ? project : x));
  }

  deleteProject(id: string) {
    // API Call: DELETE /api/projects?id=...
    this.api.delete(`/api/projects?id=${id}`).then(() => {
        this.projects.update(p => p.filter(x => x.id !== id));
    }).catch(e => console.error("Failed to delete project", e));
  }

  // --- Blog Actions ---
  addPost(post: BlogPost) {
    this.posts.update(p => [post, ...p]);
  }

  updatePost(post: BlogPost) {
    this.posts.update(p => p.map(x => x.id === post.id ? post : x));
  }

  deletePost(id: string) {
    // API Call: DELETE /api/posts?id=...
    this.api.delete(`/api/posts?id=${id}`).then(() => {
        this.posts.update(p => p.filter(x => x.id !== id));
    }).catch(e => console.error("Failed to delete post", e));
  }

  // --- Helper: File to Base64 ---
  fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- Selectors for Pagination & Filtering ---
  
  getProjectTags = computed(() => {
    const allTags = this.projects().flatMap(p => p.tags);
    return [...new Set(allTags)];
  });

  getPostTags = computed(() => {
    const allTags = this.posts().flatMap(p => p.tags || []);
    return [...new Set(allTags)];
  });
}
