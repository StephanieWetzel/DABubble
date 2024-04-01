import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../../assets/models/user.class';



@Component({
  selector: 'app-second-add-channel-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatRadioModule],
  templateUrl: './second-add-channel-dialog.component.html',
  styleUrls: ['./second-add-channel-dialog.component.scss', '../add-channel-dialog/add-channel-dialog.component.scss']
})
export class SecondAddChannelDialogComponent {
  secondDialogGroup: FormGroup | any;
  searchResults: any[] = [];
  //user: User = new User();
  users = [new User('Sebasstian','','',true,'./assets/img/avatar_clean2.png'), 
  new User('Henrik','','',true,'./assets/img/avatar_clean1.png'), 
  new User('Stephanei','','',true,'./assets/img/avatar_clean0.png')]

  constructor(public dialogRef: MatDialogRef<SecondAddChannelDialogComponent>) {
    this.secondDialogGroup = new FormGroup({
      selectedOption: new FormControl('', [Validators.required]),
      searchInput: new FormControl(''),
    })
    this.secondDialogGroup.get('searchInput').valueChanges.subscribe((searchTerm: string) => {
      this.searchResults = searchTerm ? this.findResults(searchTerm): [];
    })
  }

  private findResults(searchTerm: string): any[] {
    return this.users.filter(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  }

}
