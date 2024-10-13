import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnestComponent } from './onest.component';

describe('OnestComponent', () => {
  let component: OnestComponent;
  let fixture: ComponentFixture<OnestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
