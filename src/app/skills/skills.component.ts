import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-skills',
    imports: [],
    templateUrl: './skills.component.html',
    styleUrl: './skills.component.scss'
})
export class SkillsComponent implements AfterViewInit {
    @ViewChild('skillsContent') skillsContent!: ElementRef;

    ngAfterViewInit() {
        if (typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progressBars = entry.target.querySelectorAll('.progress-bar');
                        progressBars.forEach((bar: any) => {
                            bar.style.width = bar.getAttribute('aria-valuenow') + '%';
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            if (this.skillsContent) {
                observer.observe(this.skillsContent.nativeElement);
            }
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            const progressBars = document.querySelectorAll('.progress-bar');
            progressBars.forEach((bar: any) => {
                bar.style.width = bar.getAttribute('aria-valuenow') + '%';
            });
        }
    }
}
