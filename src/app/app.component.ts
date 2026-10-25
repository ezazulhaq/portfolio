import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { AboutComponent } from './about/about.component';
import { SkillsComponent } from './skills/skills.component';
import { ResumeComponent } from './resume/resume.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { DigitalTwinComponent } from './digital-twin/digital-twin.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ResumeComponent,
    ContactComponent,
    FooterComponent,
    DigitalTwinComponent
  ]
})
export class AppComponent {
  private readonly platformId = inject(PLATFORM_ID);
  isMobileNavActive = false;
  showBackToTop = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.showBackToTop = window.scrollY > 200;
    }
  }

  @HostListener('window:keydown.escape')
  onEscapeKey() {
    if (this.isMobileNavActive) {
      this.closeMobileNav();
    }
  }

  @HostListener('click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = event.target as HTMLElement;
    const scrollLink = target.closest('a.scrollto') as HTMLAnchorElement | null;

    if (scrollLink && scrollLink.hash) {
      const targetElement = document.querySelector(scrollLink.hash);
      if (targetElement) {
        event.preventDefault();
        this.closeMobileNav();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL hash without abrupt jumping
        history.pushState(null, '', scrollLink.hash);
      }
    }
  }

  toggleMobileNav() {
    this.isMobileNavActive = !this.isMobileNavActive;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('mobile-nav-active', this.isMobileNavActive);
    }
  }

  closeMobileNav() {
    this.isMobileNavActive = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('mobile-nav-active');
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
