import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly roles: string[] = [
    'AI Engineer & Agentic Architect',
    'Lead Java Full-Stack Developer',
    'Spring Boot & Microservices Architect',
    'Angular & Frontend Engineer',
    'Cloud & DevOps Practitioner'
  ];

  displayedRole = signal(this.roles[0]);

  private roleIndex = 0;
  private charIndex = this.roles[0].length;
  private isDeleting = true;
  private timeoutId: any;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Run animation outside Angular zone to prevent triggering global change detection on every tick
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => this.step(), 2200);
    });
  }

  private step() {
    const currentRole = this.roles[this.roleIndex];

    if (this.isDeleting) {
      this.charIndex--;
      const text = currentRole.substring(0, this.charIndex);
      this.updateText(text);

      if (this.charIndex <= 0) {
        this.isDeleting = false;
        this.roleIndex = (this.roleIndex + 1) % this.roles.length;
        this.timeoutId = setTimeout(() => this.step(), 350);
        return;
      }
      this.timeoutId = setTimeout(() => this.step(), 35);
    } else {
      this.charIndex++;
      const text = currentRole.substring(0, this.charIndex);
      this.updateText(text);

      if (this.charIndex >= currentRole.length) {
        this.isDeleting = true;
        this.timeoutId = setTimeout(() => this.step(), 2200);
        return;
      }
      this.timeoutId = setTimeout(() => this.step(), 70);
    }
  }

  private updateText(text: string) {
    this.ngZone.run(() => {
      this.displayedRole.set(text);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
