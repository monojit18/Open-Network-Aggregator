import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreContainerComponent } from './view-more-container.component';

describe('ViewMoreContainerComponent', () => {
  let component: ViewMoreContainerComponent;
  let fixture: ComponentFixture<ViewMoreContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMoreContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMoreContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
