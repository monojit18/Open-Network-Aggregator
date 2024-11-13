import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonService } from '../../services/common.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslateModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  @Output() clearChat = new EventEmitter();
  // public commonService = Inject(CommonService);
  constructor(private commonService: CommonService) {}
  clear() {
    // this.clearChat.next(true);
    this.commonService.clearMaster();
    // this.socketService.disconnect();
  }
}
