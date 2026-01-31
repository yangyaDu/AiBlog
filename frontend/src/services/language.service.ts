
import { Injectable, signal, computed, effect } from '@angular/core';

export type Language = 'en' | 'zh';

const translations = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      blog: 'Blog',
      askAi: 'Ask AI',
      about: 'About',
      uses: 'Uses'
    },
    hero: {
      role: 'Frontend & Full Stack Engineer',
      titlePrefix: 'Building the',
      titleHighlight: 'Future',
      titleSuffix: 'One Line at a Time.',
      intro: "Hi, I'm Alex. I craft robust web applications and interactive experiences.",
      techTipLabel: 'AI Generated Thought of the Day',
      viewWork: 'View My Work',
      resume: 'Download Resume',
      techStack: 'Tech Stack'
    },
    projects: {
      title: 'Featured Projects',
      subtitle: 'A selection of recent work, ranging from complex web applications to experimental AI interfaces.',
      viewCode: 'View Code',
      liveDemo: 'Live Demo'
    },
    blog: {
      title: 'Technical Writings',
      subtitle: 'Thoughts on software architecture, performance optimization, and the future of web dev.',
      readMore: 'Read Article',
      toc: 'Table of Contents',
      back: 'Back to List'
    },
    about: {
      title: 'About Me',
      description: "I'm a passionate developer who loves building tools that help people.",
      content: "My journey started 5 years ago when I wrote my first line of Python. Since then, I've dived deep into the web ecosystem, mastering Angular, React, and Node.js. I believe in clean code, user-centric design, and continuous learning."
    },
    uses: {
      title: 'What I Use',
      subtitle: 'A curated list of the hardware and software I use daily to build things.',
      hardware: 'Hardware',
      software: 'Software',
      stack: 'Tech Stack'
    },
    chat: {
      header: "Alex's AI Avatar",
      powered: 'Powered by Gemini 2.5 Flash',
      init: "Hello! I'm Alex's AI assistant. I can tell you about his work experience, tech stack, or specific projects. What would you like to know?",
      placeholder: 'Ask about my experience, skills, or projects...',
      thinking: 'Thinking...'
    },
    footer: {
      built: 'Built with Angular 21+ & Tailwind & Gemini'
    }
  },
  zh: {
    nav: {
      home: '首页',
      projects: '项目',
      blog: '博客',
      askAi: 'AI 助手',
      about: '关于',
      uses: '装备'
    },
    hero: {
      role: '前端 & 全栈工程师',
      titlePrefix: '构建',
      titleHighlight: '未来',
      titleSuffix: '，始于代码。',
      intro: '嗨，我是 Alex。我致力于打造健壮的 Web 应用和令人惊叹的交互体验。',
      techTipLabel: 'AI 每日灵感',
      viewWork: '查看作品',
      resume: '下载简历',
      techStack: '技术栈'
    },
    projects: {
      title: '精选项目',
      subtitle: '近期作品展示，涵盖复杂 Web 应用到实验性 AI 接口。',
      viewCode: '查看代码',
      liveDemo: '在线演示'
    },
    blog: {
      title: '技术专栏',
      subtitle: '关于软件架构、性能优化和 Web 开发未来的思考。',
      readMore: '阅读文章',
      toc: '目录',
      back: '返回列表'
    },
    about: {
      title: '关于我',
      description: '我是一名热衷于开发实用工具的开发者。',
      content: '我的旅程始于5年前，那是我的第一行 Python 代码。从那时起，我深入研究了 Web 生态系统，掌握了 Angular、React 和 Node.js. 我信奉整洁代码、以用户为中心的设计和终身学习。'
    },
    uses: {
      title: '我的装备',
      subtitle: '我日常用于构建产品的硬件和软件清单。',
      hardware: '硬件',
      software: '软件',
      stack: '技术栈'
    },
    chat: {
      header: 'Alex 的数字替身',
      powered: '基于 Gemini 2.5 Flash',
      init: '你好！我是 Alex 的 AI 助手。我可以为你介绍他的工作经验、技术栈或具体项目。你想了解什么？',
      placeholder: '询问关于我的经验、技能或项目...',
      thinking: '思考中...'
    },
    footer: {
      built: '基于 Angular 21+ & Tailwind & Gemini 构建'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  lang = signal<Language>('en'); // Default to 'en' initially, will be overridden in constructor
  
  text = computed(() => translations[this.lang()]);

  constructor() {
    this.initLanguage();
  }

  private initLanguage() {
    // 1. Try to get from Cookie
    const cookieLang = this.getCookie('devfolio_lang');
    if (cookieLang === 'zh' || cookieLang === 'en') {
      this.lang.set(cookieLang);
      return;
    }

    // 2. Try to get from Browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      this.lang.set('zh');
    } else {
      this.lang.set('en');
    }
    
    // Save the detected language to cookie initially as well
    this.setCookie('devfolio_lang', this.lang(), 365);
  }

  setLang(l: Language) {
    this.lang.set(l);
    this.setCookie('devfolio_lang', l, 365);
  }

  toggleLang() {
    const newLang = this.lang() === 'en' ? 'zh' : 'en';
    this.setLang(newLang);
  }

  // Helper: Set Cookie
  private setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  // Helper: Get Cookie
  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}