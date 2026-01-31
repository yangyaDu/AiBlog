
import { Injectable } from '@angular/core';

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private get token() {
    const session = localStorage.getItem('devfolio_session');
    return session ? JSON.parse(session).token : '';
  }

  async request<T>(method: string, url: string, body?: any): Promise<T> {
    const headers: any = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    let data: any;
    try {
      data = await res.json();
    } catch (e) {
      if (!res.ok) throw new ApiError(res.status, res.statusText || 'Server Error');
    }

    // Handle HTTP Errors (4xx, 5xx) with Backend provided Code
    if (!res.ok) {
       // Use backend code if available, otherwise fallback to HTTP status code logic
       const code = data?.code || (res.status === 401 ? 4001 : 5000);
       const msg = data?.message || res.statusText;
       throw new ApiError(code, msg);
    }

    // Handle Business Logic Errors (HTTP 200 but code != 0)
    if (data && typeof data.code === 'number' && data.code !== 0) {
       throw new ApiError(data.code, data.message);
    }

    // Return the data payload directly
    return data?.data;
  }

  get<T>(url: string) { return this.request<T>('GET', url); }
  post<T>(url: string, body?: any) { return this.request<T>('POST', url, body); }
  delete<T>(url: string) { return this.request<T>('DELETE', url); }
}
