import { Component, Inject, Input } from '@angular/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-llm',
  standalone: true,
  imports: [GenTranslatePipe, CommonModule],
  templateUrl: './llm.component.html',
  styleUrl: './llm.component.scss',
})
export class LlmComponent {
  @Input() message: any;

  constructor(public commonService: CommonService) {}
}
