import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../../../assets/models/channel.class';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent {

  @Input() channel: Channel | null = null;
  @Output() isClosed = new EventEmitter<boolean>();

  close() {
    this.isClosed.emit(true);
  }

}
