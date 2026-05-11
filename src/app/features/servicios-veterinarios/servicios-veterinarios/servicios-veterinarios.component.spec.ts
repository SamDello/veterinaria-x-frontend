import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosVeterinariosComponent } from './servicios-veterinarios.component';

describe('ServiciosVeterinariosComponent', () => {
  let component: ServiciosVeterinariosComponent;
  let fixture: ComponentFixture<ServiciosVeterinariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosVeterinariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiciosVeterinariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
