import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerativeInteractionComponent } from './generative-interaction.component';

describe('GenerativeInteractionComponent', () => {
  let component: GenerativeInteractionComponent;
  let fixture: ComponentFixture<GenerativeInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerativeInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerativeInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
