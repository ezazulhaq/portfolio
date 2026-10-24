import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly platformId = inject(PLATFORM_ID);

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  isSubmitted = false;
  copySuccess = false;
  errorMessage = '';

  onSubmit() {
    if (!this.contactForm.name.trim() || !this.contactForm.email.trim() || !this.contactForm.subject.trim() || !this.contactForm.message.trim()) {
      this.errorMessage = 'Please complete all required fields before submitting.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    // Simulate clean dispatch with UI feedback
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSubmitted = true;
    }, 600);
  }

  openEmailClient() {
    if (!isPlatformBrowser(this.platformId)) return;
    const to = 'ezazulhaq.it@gmail.com';
    const subject = encodeURIComponent(this.contactForm.subject || 'Portfolio Inquiry');
    const body = encodeURIComponent(
      `Hello Ezazul,\n\nName: ${this.contactForm.name}\nEmail: ${this.contactForm.email}\n\nMessage:\n${this.contactForm.message}\n`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  copyDetails() {
    if (!isPlatformBrowser(this.platformId)) return;
    const text = `From: ${this.contactForm.name} (${this.contactForm.email})\nSubject: ${this.contactForm.subject}\nMessage:\n${this.contactForm.message}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.copySuccess = true;
        setTimeout(() => (this.copySuccess = false), 3000);
      });
    }
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    this.isSubmitted = false;
    this.isSubmitting = false;
    this.errorMessage = '';
    this.copySuccess = false;
  }
}
