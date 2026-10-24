import { Component, AfterViewInit, inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const Typed: any;

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  @ViewChild('typedElement') typedElement!: ElementRef;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Initialize Typed if available and not yet initialized
    if (typeof Typed !== 'undefined' && this.typedElement) {
      const el = this.typedElement.nativeElement;
      if (!el.classList.contains('typed-initialized')) {
        el.classList.add('typed-initialized');
        const items = el.getAttribute('data-typed-items');
        if (items) {
          const strings = items.split(',').map((s: string) => s.trim());
          new Typed(el, {
            strings,
            loop: true,
            typeSpeed: 70,
            backSpeed: 35,
            backDelay: 2000
          });
        }
      }
    }
  }
}
