import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface LeadSubmission {
  name: string;
  email: string;
  company?: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DigitalTwinService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly currentStreamingText = signal<string>('');
  readonly showLeadForm = signal<boolean>(false);
  readonly isSubmittingLead = signal<boolean>(false);
  readonly leadStatus = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  readonly hasUnread = signal<boolean>(false);

  private abortController: AbortController | null = null;

  constructor() {
    this.initWelcomeMessage();
  }

  private initWelcomeMessage() {
    const welcome: ChatMessage = {
      id: 'welcome-msg',
      role: 'model',
      content: `👋 **Hi there! I'm Ezazul's AI Digital Twin.**

I'm grounded on Ezaz's verified 10+ years of engineering experience across **Genpact** and **TCS**, his production applications ([The Taqwa Tracker](https://thetaqwatracker.com/), [VividSpend](https://vividspend.chotabuziness.com)), and his architecture expertise in **Agentic AI, RAG, Spring Boot, and Angular**.

How can I help you today? You can select a quick question below or ask me anything directly!`,
      timestamp: new Date(),
    };
    this.messages.set([welcome]);
  }

  toggleChat(): void {
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      this.hasUnread.set(false);
    }
  }

  openChat(initialPrompt?: string): void {
    this.isOpen.set(true);
    this.hasUnread.set(false);
    if (initialPrompt) {
      this.sendMessage(initialPrompt);
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  openLeadForm(): void {
    this.showLeadForm.set(true);
    this.leadStatus.set(null);
  }

  closeLeadForm(): void {
    this.showLeadForm.set(false);
  }

  resetChat(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isLoading.set(false);
    this.currentStreamingText.set('');
    this.showLeadForm.set(false);
    this.leadStatus.set(null);
    this.initWelcomeMessage();
  }

  async sendMessage(userText: string): Promise<void> {
    const cleanText = userText?.trim();
    if (!cleanText || this.isLoading()) return;

    if (!isPlatformBrowser(this.platformId)) return;

    // 1. Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: new Date(),
    };

    const previousHistory = this.messages()
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({ role: m.role, content: m.content }));

    this.messages.update((msgs) => [...msgs, userMsg]);
    this.isLoading.set(true);
    this.currentStreamingText.set('');

    this.abortController = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: cleanText,
          history: previousHistory,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        let errMessage = 'Unable to connect to digital twin';
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {
          // ignore parsing error
        }
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by this browser');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // Keep-alive or comment

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              continue;
            }

            let parsed: any = null;
            try {
              parsed = JSON.parse(dataStr);
            } catch (err: any) {
              if (err.message && err.message !== 'Unexpected end of JSON input') {
                console.warn('SSE line parse error:', err);
              }
            }

            if (parsed) {
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                this.currentStreamingText.set(accumulatedText);
              }
            }
          } else if (trimmed.startsWith('event: error')) {
            // Handled on subsequent data line
          }
        }
      }

      // Stream completed successfully
      const finalContent = accumulatedText.trim() || "I apologize, but I couldn't generate a response. Please try asking again.";
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: finalContent,
        timestamp: new Date(),
      };

      this.messages.update((msgs) => [...msgs, modelMsg]);
      this.currentStreamingText.set('');

      // If chat is closed, mark unread
      if (!this.isOpen()) {
        this.hasUnread.set(true);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request cancelled by user
        return;
      }

      console.error('Chat generation error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Connection Error:** ${err.message || 'Something went wrong while contacting Ezaz’s digital twin.'}\n\nYou can also reach Ezaz directly at [ezazulhaq.it@gmail.com](mailto:ezazulhaq.it@gmail.com) or call [+91 9930800797](tel:+919930800797).`,
        timestamp: new Date(),
        isError: true,
      };
      this.messages.update((msgs) => [...msgs, errorMsg]);
      this.currentStreamingText.set('');
    } finally {
      this.isLoading.set(false);
      this.abortController = null;
    }
  }

  async submitLead(data: LeadSubmission): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;

    this.isSubmittingLead.set(true);
    this.leadStatus.set(null);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit inquiry.');
      }

      this.leadStatus.set({
        type: 'success',
        message: 'Thank you! Your inquiry has been sent to Ezaz. He will reach out to you shortly.',
      });

      // Post confirmation into chat stream
      const confirmationMsg: ChatMessage = {
        id: `lead-ack-${Date.now()}`,
        role: 'model',
        content: `✅ **Lead Received!**\nThank you, **${data.name}**. I have recorded your inquiry for Ezazul. He has received your contact details (${data.email}) and will review your message promptly!`,
        timestamp: new Date(),
      };
      this.messages.update((msgs) => [...msgs, confirmationMsg]);

      setTimeout(() => {
        this.showLeadForm.set(false);
      }, 2500);

      return true;
    } catch (err: any) {
      console.error('Lead submission failed:', err);
      this.leadStatus.set({
        type: 'error',
        message: err.message || 'Unable to record your message. Please email ezazulhaq.it@gmail.com directly.',
      });
      return false;
    } finally {
      this.isSubmittingLead.set(false);
    }
  }
}

