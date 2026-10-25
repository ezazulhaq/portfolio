import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigitalTwinService, LeadSubmission } from './digital-twin.service';

@Component({
  selector: 'app-digital-twin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './digital-twin.component.html',
  styleUrl: './digital-twin.component.scss',
})
export class DigitalTwinComponent implements AfterViewChecked {
  protected readonly twinService = inject(DigitalTwinService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('chatScrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') private messageInputField?: ElementRef<HTMLTextAreaElement>;

  userInput = '';
  private shouldScrollToBottom = false;

  // Lead form model
  leadData: LeadSubmission = {
    name: '',
    email: '',
    company: '',
    message: '',
  };

  starterPrompts = [
    { label: 'Agentic AI & RAG Experience', prompt: 'Tell me about your experience architecting Agentic AI systems and RAG pipelines.' },
    { label: 'GE Healthcare & APIGEE', prompt: 'What were your key accomplishments and architecture decisions for GE Healthcare at Genpact?' },
    { label: 'Core Banking at TCS', prompt: 'Tell me about the core banking implementations you led at TCS and your security achievements.' },
    { label: 'The Taqwa Tracker & VividSpend', prompt: 'Tell me about your live production apps: The Taqwa Tracker and VividSpend.' },
    { label: 'Hiring & Availability', prompt: 'Are you currently open for contract consulting or lead engineering roles, and how can we connect?' },
  ];

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.twinService.isOpen()) {
      this.twinService.closeChat();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.twinService.toggleChat();
    if (this.twinService.isOpen()) {
      this.shouldScrollToBottom = true;
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.messageInputField?.nativeElement?.focus();
        }
      }, 200);
    }
  }

  closeChat(): void {
    this.twinService.closeChat();
  }

  resetChat(): void {
    this.twinService.resetChat();
    this.shouldScrollToBottom = true;
  }

  sendCurrentMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.twinService.isLoading()) return;

    this.userInput = '';
    this.twinService.sendMessage(text);
    this.shouldScrollToBottom = true;
  }

  onTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendCurrentMessage();
    }
  }

  useStarterPrompt(prompt: string): void {
    this.twinService.sendMessage(prompt);
    this.shouldScrollToBottom = true;
  }

  toggleLeadForm(): void {
    if (this.twinService.showLeadForm()) {
      this.twinService.closeLeadForm();
    } else {
      this.twinService.openLeadForm();
      this.shouldScrollToBottom = true;
    }
  }

  async submitLeadForm(): Promise<void> {
    if (!this.leadData.name || !this.leadData.email || !this.leadData.message) {
      return;
    }

    const success = await this.twinService.submitLead(this.leadData);
    if (success) {
      this.leadData = { name: '', email: '', company: '', message: '' };
      this.shouldScrollToBottom = true;
    }
  }

  private scrollToBottom(): void {
    if (!isPlatformBrowser(this.platformId) || !this.scrollContainer) return;
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {
      // ignore
    }
  }

  /**
   * Safe lightweight markdown formatter
   */
  formatMarkdown(rawText: string): string {
    if (!rawText) return '';

    // 1. Escape HTML
    let escaped = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Code blocks ```code```
    escaped = escaped.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="chat-code-block"><code>$2</code></pre>');

    // 3. Inline code `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    // 4. Bold **text**
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 5. Italic *text*
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 6. Markdown links [text](url)
    escaped = escaped.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1 <i class="bi bi-box-arrow-up-right small"></i></a>'
    );
    escaped = escaped.replace(
      /\[([^\]]+)\]\((mailto:[^\s)]+)\)/g,
      '<a href="$2" class="chat-link">$1</a>'
    );
    escaped = escaped.replace(
      /\[([^\]]+)\]\((tel:[^\s)]+)\)/g,
      '<a href="$2" class="chat-link">$1</a>'
    );

    // 7. Bullet lists
    escaped = escaped.replace(/(?:^|\n)[*-] (.+)/g, '<div class="chat-bullet">&bull; $1</div>');

    // 8. Paragraphs & line breaks
    escaped = escaped.replace(/\n\n/g, '<div class="chat-spacer"></div>');
    escaped = escaped.replace(/\n/g, '<br>');

    return escaped;
  }
}

