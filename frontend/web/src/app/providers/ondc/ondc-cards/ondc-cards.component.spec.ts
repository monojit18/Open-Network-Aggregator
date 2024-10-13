import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OndcCardsComponent } from './ondc-cards.component';

describe('OndcCardsComponent', () => {
  let component: OndcCardsComponent;
  let fixture: ComponentFixture<OndcCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OndcCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OndcCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
