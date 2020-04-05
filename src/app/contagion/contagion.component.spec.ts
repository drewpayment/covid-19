import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContagionComponent } from './contagion.component';

describe('ContagionComponent', () => {
  let component: ContagionComponent;
  let fixture: ComponentFixture<ContagionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContagionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContagionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
