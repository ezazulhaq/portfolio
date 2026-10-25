import { Component, AfterViewInit, ElementRef, ViewChild, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

export interface SkillItem {
  name: string;
  level: number;
  badge?: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  featured?: boolean;
  skills: SkillItem[];
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements AfterViewInit {
  @ViewChild('skillsContent') skillsContent!: ElementRef;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  isAnimated = false;

  skillCategories: SkillCategory[] = [
    {
      title: 'Generative AI & Agentic Architecture',
      icon: 'bx bx-bot',
      featured: true,
      skills: [
        { name: 'RAG (Retrieval-Augmented Generation)', level: 90, badge: 'Expert' },
        { name: 'Model Context Protocol (MCP)', level: 90, badge: 'Expert' },
        { name: 'Google Agent SDK & GenAI', level: 85, badge: 'Advanced' },
        { name: 'LangChain & LangGraph', level: 85, badge: 'Advanced' },
        { name: 'Agentic Skill Architecture & Harness', level: 90, badge: 'Expert' }
      ]
    },
    {
      title: 'Backend & Microservices',
      icon: 'bx bx-server',
      skills: [
        { name: 'Java (Core & Advanced)', level: 90, badge: 'Expert' },
        { name: 'Spring Boot & Microservices', level: 95, badge: 'Expert' },
        { name: 'FastAPI', level: 75, badge: 'Proficient' },
        { name: 'Python', level: 80, badge: 'Advanced' },
        { name: 'Node.js', level: 75, badge: 'Proficient' }
      ]
    },
    {
      title: 'Frontend & UI Engineering',
      icon: 'bx bx-code-alt',
      skills: [
        { name: 'Angular', level: 90, badge: 'Expert' },
        { name: 'TypeScript & JavaScript', level: 85, badge: 'Advanced' },
        { name: 'CSS3 / SCSS / Bootstrap', level: 90, badge: 'Expert' }
      ]
    },
    {
      title: 'Cloud & DevOps',
      icon: 'bx bx-cloud',
      skills: [
        { name: 'Amazon Web Services (AWS)', level: 85, badge: 'Advanced' },
        { name: 'Google Cloud Platform (GCP)', level: 80, badge: 'Advanced' },
        { name: 'Docker & Containers', level: 80, badge: 'Advanced' },
        { name: 'CI/CD (Jenkins, GitHub Actions)', level: 80, badge: 'Advanced' }
      ]
    },
    {
      title: 'Database & Integrations',
      icon: 'bx bx-data',
      skills: [
        { name: 'SQL (PostgreSQL, MySQL, Oracle)', level: 90, badge: 'Expert' },
        { name: 'APIGEE & API Security (OAuth, OWASP)', level: 85, badge: 'Advanced' },
        { name: 'WebRTC & Realtime Communication', level: 80, badge: 'Advanced' }
      ]
    }
  ];

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof IntersectionObserver !== 'undefined' && this.skillsContent) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isAnimated = true;
            this.cdr.detectChanges();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(this.skillsContent.nativeElement);
    } else {
      this.isAnimated = true;
      this.cdr.detectChanges();
    }
  }
}
