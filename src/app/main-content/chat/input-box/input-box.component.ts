import { Component } from '@angular/core';
import { EditorModule } from '@tinymce/tinymce-angular';
import { RawEditorOptions } from 'tinymce';

@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [EditorModule],
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.scss'
})


export class InputBoxComponent {
  public editorInit: RawEditorOptions =  {
    base_url: '/tinymce',
    suffix: '.min',
    menubar: false,
    toolbar_location: 'bottom',
    plugins: 'autoresize emoticons link',
    autoresize_bottom_margin: 0,
    max_height: 500,
    placeholder: 'Nachricht an Chat ... ',
    statusbar: false,
    toolbar: 'link emoticons',
  };

}
