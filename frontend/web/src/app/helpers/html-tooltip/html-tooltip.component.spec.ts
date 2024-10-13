import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlTooltipComponent } from './html-tooltip.component';

describe('HtmlTooltipComponent', () => {
  let component: HtmlTooltipComponent;
  let fixture: ComponentFixture<HtmlTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmlTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HtmlTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
