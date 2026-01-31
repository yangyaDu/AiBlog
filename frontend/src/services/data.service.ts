
import { Injectable, signal, effect, computed } from '@angular/core';

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
  authorId?: string; // Owner ID
  title: string;
  date: string; // Display date string
  timestamp: number; // For sorting
  readTime: string;
  excerpt: string;
  content: string; 
  coverImage?: string;
  tags?: string[]; // Added tags for filtering
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
    },
    {
      id: '2',
      authorId: 'admin',
      title: "E-Commerce Microservices",
      description: "Scalable backend architecture using Node.js and gRPC. Features event-driven order processing and inventory management.",
      tags: ["Node.js", "Microservices", "Docker"],
      image: "https://picsum.photos/600/400?random=2",
      date: Date.now() - 10000
    },
    {
      id: '3',
      authorId: 'admin',
      title: "AI Code Assistant",
      description: "VS Code extension that uses generative AI to explain complex regex patterns and generate unit tests automatically.",
      tags: ["TypeScript", "Gemini API", "VS Code"],
      image: "https://picsum.photos/600/400?random=3",
      date: Date.now() - 20000
    }
  ];

  private defaultPosts: BlogPost[] = [
    {
      id: '1',
      authorId: 'admin',
      title: "Optimizing Angular Change Detection with Signals",
      date: "Oct 24, 2024",
      timestamp: Date.now(),
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
    },
    {
      id: '2',
      authorId: 'admin',
      title: "Building Resilient APIs with Node.js",
      date: "Sep 15, 2024",
      timestamp: Date.now() - 100000,
      readTime: "8 min read",
      excerpt: "Strategies for handling backpressure, implementing rate limiting, and ensuring idempotency in distributed systems.",
      tags: ["Node.js", "Backend"],
      content: `
Building APIs that survive production traffic is an art. Let's talk about resilience.

## Rate Limiting

Never let a single user bring down your service. Use Token Bucket or Leaky Bucket algorithms.
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
    this.projects.update(p => p.filter(x => x.id !== id));
  }

  // --- Blog Actions ---
  addPost(post: BlogPost) {
    this.posts.update(p => [post, ...p]);
  }

  updatePost(post: BlogPost) {
    this.posts.update(p => p.map(x => x.id === post.id ? post : x));
  }

  deletePost(id: string) {
    this.posts.update(p => p.filter(x => x.id !== id));
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
  
  // Get unique tags from projects
  getProjectTags = computed(() => {
    const allTags = this.projects().flatMap(p => p.tags);
    return [...new Set(allTags)];
  });

  // Get unique tags from posts
  getPostTags = computed(() => {
    const allTags = this.posts().flatMap(p => p.tags || []);
    return [...new Set(allTags)];
  });
}