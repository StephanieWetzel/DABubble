import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
  AsyncValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../../../../assets/services/firebase-service';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
} from 'rxjs';

@Component({
  selector: 'app-add-channel-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss',
})
export class AddChannelDialogComponent {
  firstDialogGroup: FormGroup | any;


  constructor(
    public dialogRef: MatDialogRef<AddChannelDialogComponent>,
    public firestore: FirebaseService
  ) { }


  /**
 * Initializes the component by creating a form group for the first dialog.
 */
  ngOnInit() {
    this.firstDialogGroup = new FormGroup({
      channelName: new FormControl('', {
        validators: Validators.required,
        asyncValidators: this.createAsyncValidator(),
        updateOn: 'blur',
      }),
      description: new FormControl(''),
    });
  }


  /**
   * Handles the closure of the dialog, returning the selected option.
   */
  onClose(): void {
    if (this.firstDialogGroup.valid) {
      this.dialogRef.close(this.firstDialogGroup.value);
    }
  }


  /**
 * Closes the dialog without saving changes.
 */
  cancelCreation() {
    this.dialogRef.close();
  }


  /**
   * Creates an asynchronous validator function to check if a channel name already exists.
   * @returns {AsyncValidatorFn} - The asynchronous validator function.
   */
  createAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return this.firestore.checkChannelNameExists(control.value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((exists) => (exists ? { channelNameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}