import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOversightComponent } from './member-oversight.component';

describe('MemberOversightComponent', () => {
  let component: MemberOversightComponent;
  let fixture: ComponentFixture<MemberOversightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberOversightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemberOversightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
