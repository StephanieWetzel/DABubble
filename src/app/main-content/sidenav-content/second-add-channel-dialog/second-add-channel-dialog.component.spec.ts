import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondAddChannelDialogComponent } from './second-add-channel-dialog.component';

describe('SecondAddChannelDialogComponent', () => {
  let component: SecondAddChannelDialogComponent;
  let fixture: ComponentFixture<SecondAddChannelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondAddChannelDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecondAddChannelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
