import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesGraphComponent } from './countries-graph.component';

describe('CountriesGraphComponent', () => {
  let component: CountriesGraphComponent;
  let fixture: ComponentFixture<CountriesGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountriesGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountriesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
