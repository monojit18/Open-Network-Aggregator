import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NinjaModalComponent } from './ninja-modal.component';

describe('NinjaModalComponent', () => {
  let component: NinjaModalComponent;
  let fixture: ComponentFixture<NinjaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NinjaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NinjaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
