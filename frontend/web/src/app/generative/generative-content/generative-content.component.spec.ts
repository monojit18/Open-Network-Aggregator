import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerativeContentComponent } from './generative-content.component';

describe('GenerativeContentComponent', () => {
  let component: GenerativeContentComponent;
  let fixture: ComponentFixture<GenerativeContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerativeContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerativeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
