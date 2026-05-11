import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtencionesVeterinariasComponent } from './atenciones-veterinarias.component';

describe('AtencionesVeterinariasComponent', () => {
  let component: AtencionesVeterinariasComponent;
  let fixture: ComponentFixture<AtencionesVeterinariasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionesVeterinariasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AtencionesVeterinariasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
