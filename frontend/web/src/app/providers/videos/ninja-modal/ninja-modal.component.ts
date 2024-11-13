import { Component, inject, Input, input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ninja-modal',
  standalone: true,
  imports: [],
  templateUrl: './ninja-modal.component.html',
  styleUrl: './ninja-modal.component.scss',
})
export class NinjaModalComponent implements OnInit {
  @Input() embedUrl: string;
  safeUrl: SafeUrl;
  private sanitizer = inject(DomSanitizer);
  ngOnInit(): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl);
    console.log('!! safe URL', this.safeUrl, this.embedUrl);
  }
}
