import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OndcComponent } from './ondc.component';

describe('OndcComponent', () => {
  let component: OndcComponent;
  let fixture: ComponentFixture<OndcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OndcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OndcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
