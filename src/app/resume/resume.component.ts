import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {
  private readonly platformId = inject(PLATFORM_ID);

  printResume() {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }
}
