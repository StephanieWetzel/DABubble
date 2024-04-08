import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-preview-dialog',
  standalone: true,
  imports: [NgIf],
  templateUrl: './file-preview-dialog.component.html',
  styleUrl: './file-preview-dialog.component.scss'
})
export class FilePreviewDialogComponent {
  isImage: boolean;
  fileUrl: string;

  constructor(
    public dialogRef: MatDialogRef<FilePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fileUrl: string, fileType: string }
  ) {
    this.fileUrl = data.fileUrl;
    this.isImage = data.fileType.startsWith('image');
  }
}
