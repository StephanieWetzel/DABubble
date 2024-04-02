import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyHeadbarComponent } from './reply-headbar.component';

describe('ReplyHeadbarComponent', () => {
  let component: ReplyHeadbarComponent;
  let fixture: ComponentFixture<ReplyHeadbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyHeadbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReplyHeadbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
