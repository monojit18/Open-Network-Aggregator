import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgriComponent } from './agri.component';

describe('AgriComponent', () => {
  let component: AgriComponent;
  let fixture: ComponentFixture<AgriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
