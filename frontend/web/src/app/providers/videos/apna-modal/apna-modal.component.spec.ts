import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApnaModalComponent } from './apna-modal.component';

describe('ApnaModalComponent', () => {
  let component: ApnaModalComponent;
  let fixture: ComponentFixture<ApnaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApnaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApnaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
