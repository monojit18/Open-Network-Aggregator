import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { YoutubeModalComponent } from './youtube-modal.component';

describe('YoutubeModalComponent', () => {
  let component: YoutubeModalComponent;
  let fixture: ComponentFixture<YoutubeModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
