import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    // Safe check for process.env to prevent crashes in environments where it's not polyfilled
    const apiKey = (typeof process !== 'undefined' && process.env && process.env['API_KEY']) ? process.env['API_KEY'] : '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  initChat(programmerName: string, skills: string[], projects: string[]) {
    const systemInstruction = `You are an AI Assistant for a programmer's portfolio website named ${programmerName}.
    
    Here is the programmer's profile:
    - Skills: ${skills.join(', ')}
    - Key Projects: ${projects.join(', ')}
    
    Your goal is to answer visitor questions about ${programmerName} professionally, enthusiastically, and concisely. 
    Act like a helpful colleague recommending them for a job.
    If asked about contact info, suggest looking at the Contact section.
    Keep answers under 100 words unless asked for detail.
    
    IMPORTANT: You must reply in the language the user is speaking to you. If the user speaks English, reply in English. If the user speaks Chinese, reply in Chinese.
    `;

    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      }
    });
  }

  async sendMessage(message: string, langContext: 'en' | 'zh'): Promise<string> {
    if (!this.chat) {
      return "AI Chat not initialized.";
    }
    try {
      const response = await this.chat.sendMessage({ message: `[User's current UI language is ${langContext}] ${message}` });
      return response.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return langContext === 'zh' 
        ? "抱歉，我现在无法连接到神经网络。请稍后再试。" 
        : "Sorry, I'm having trouble connecting to the neural network right now. Please try again later.";
    }
  }

  // Generates a quick tech tip or quote
  async generateTechTip(lang: 'en' | 'zh' = 'en'): Promise<string> {
    const prompt = lang === 'zh' 
      ? 'Generate a short, single-sentence inspiring quote or tip for a software developer in Chinese. No markdown, just text.'
      : 'Generate a short, single-sentence inspiring quote or tip for a software developer. No markdown, just text.';
      
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (e) {
      return lang === 'zh' ? "代码是逻辑写就的诗篇。" : "Code is poetry written in logic.";
    }
  }

  // Summarize blog post content
  async summarizeArticle(content: string, lang: 'en' | 'zh'): Promise<string> {
    const prompt = lang === 'zh'
        ? `请阅读以下技术博客文章，并为开发者受众生成一个简明扼要的摘要（3个要点）。请使用中文回答，并使用Markdown格式的项目符号。\n\n文章内容:\n${content.substring(0, 10000)}`
        : `Please read the following technical blog post and generate a concise summary (3 bullet points) for a developer audience. Answer in English using Markdown bullet points.\n\nArticle Content:\n${content.substring(0, 10000)}`;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Summary failed", error);
        return lang === 'zh' ? "无法生成摘要。" : "Unable to generate summary.";
    }
  }
}