import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitatFormComponent } from './form.component';

describe('Form', () => {
  let component: CitatFormComponent;
  let fixture: ComponentFixture<CitatFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitatFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
