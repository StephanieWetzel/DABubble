import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-headbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule, CommonModule],
  templateUrl: './headbar.component.html',
  styleUrl: './headbar.component.scss'
})
export class HeadbarComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.getDropdownPosition();
  }

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  isOpen = false;

  toggleDropdown() {
    
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.getDropdownPosition(), 0);
    }
  }
  
  getDropdownPosition() {
    const buttonRect = this.dropdownContainer.nativeElement.getBoundingClientRect();
    return {
      position: 'fixed',
      top: `${buttonRect.bottom}px`, // Positioniert das Menü unter dem Button
      left: `${buttonRect.right}px`, // Startet das Menü vom rechten Rand des Buttons
      transform: 'translateX(-100%)' // Verschiebt das Menü zurück, so dass der rechte Rand des Menüs mit dem des Buttons übereinstimmt
    };
  }
}
