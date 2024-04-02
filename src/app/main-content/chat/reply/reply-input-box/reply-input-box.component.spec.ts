import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyInputBoxComponent } from './reply-input-box.component';

describe('ReplyInputBoxComponent', () => {
  let component: ReplyInputBoxComponent;
  let fixture: ComponentFixture<ReplyInputBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyInputBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReplyInputBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
