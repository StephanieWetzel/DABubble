import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PPolicyComponent } from './p-policy.component';

describe('PPolicyComponent', () => {
  let component: PPolicyComponent;
  let fixture: ComponentFixture<PPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPolicyComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});