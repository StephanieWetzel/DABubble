import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileAvatarEditComponent } from './profile-avatar-edit.component';

describe('ProfileAvatarEditComponent', () => {
  let component: ProfileAvatarEditComponent;
  let fixture: ComponentFixture<ProfileAvatarEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAvatarEditComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileAvatarEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});