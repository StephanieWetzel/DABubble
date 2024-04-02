import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyMessagesComponent } from './reply-messages.component';

describe('ReplyMessagesComponent', () => {
  let component: ReplyMessagesComponent;
  let fixture: ComponentFixture<ReplyMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyMessagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReplyMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
