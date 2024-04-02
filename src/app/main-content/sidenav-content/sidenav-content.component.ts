import { Component, ViewEncapsulation } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { User } from './user-test.class';
import { CommonModule } from '@angular/common';
import { AddChannelDialogComponent } from "./add-channel-dialog/add-channel-dialog.component";
import { SecondAddChannelDialogComponent } from './second-add-channel-dialog/second-add-channel-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';

const EDIT_SQUARE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" 
  width="24"><path d="M232-172q-26 0-43-17t-17-43v-496q0-26 17-43t43-17h329l-28 28H232q-12 0-22 10t-10 22v496q0 12 10 22t22 10h496q12 0 22-10t10-22v-306l28-28v334q0 26-17 43t-43
  17H232Zm248-308Zm-68 68v-85l355-355q5-5 10-6.5t11-1.5q5 0 10 1.5t9 5.5l41 39q5 5 7.5 11t2.5 12q0 6-1.5 11t-6.5 10L492-412h-80Zm418-378-41-44
  41 44ZM440-440h40l277-277-20-20-23-22-274 274v45Zm297-297-23-22 23 22 20 20-20-20Z"/></svg>`;

@Component({
    selector: 'app-sidenav-content',
    standalone: true,
    templateUrl: './sidenav-content.component.html',
    styleUrl: './sidenav-content.component.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, MatExpansionModule, MatIconModule, AddChannelDialogComponent, MatDialogModule, SecondAddChannelDialogComponent]
})
export class SidenavContentComponent {
  isUserOnline: boolean = true;
  users: User[] = [new User(true, 'Stephanie','', './assets/img/avatar_clean0.png'), 
  new User(false, 'Henrik', '', './assets/img/avatar_clean1.png'),
  new User(false, 'Sebastian', '', './assets/img/avatar_clean2.png')
]
  constructor(public dialog: MatDialog) {
    //const dialogRef = this.dialog.open(SecondAddChannelDialogComponent)
  }

  addChannel() {
    const dialogRef = this.dialog.open(AddChannelDialogComponent, {
      panelClass: 'custom-add-channel-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log("Dialog result: ", result);
      if (result !== undefined) {
        this.openSecondDialog(result);
      }
    });
  }

  openSecondDialog(firstDialogData: any): void {
    const secondDialogRef = this.dialog.open(SecondAddChannelDialogComponent, {
      panelClass: 'custom-add-channel-dialog'
    });
    console.log(firstDialogData);
    secondDialogRef.afterClosed().subscribe(result => {
      
        console.log(result, firstDialogData);
      
    })
  }
}

