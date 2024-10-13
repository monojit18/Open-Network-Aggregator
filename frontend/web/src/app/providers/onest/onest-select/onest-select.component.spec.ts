import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnestSelectComponent } from './onest-select.component';

describe('OnestSelectComponent', () => {
  let component: OnestSelectComponent;
  let fixture: ComponentFixture<OnestSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnestSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnestSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
