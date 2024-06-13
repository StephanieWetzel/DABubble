import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CustomDatePipe } from "../../messages/date-pipe/custom-date.pipe";
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';
import { Subscription } from 'rxjs';
import { Message } from '../../../../../assets/models/message.class';
import { User } from '../../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../../assets/services/profileAuth.service';
import { CustomTimePipe } from "../../messages/time-pipe/custom-time.pipe";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';



@Component({
  selector: 'app-reply-messages',
  standalone: true,
  templateUrl: './reply-messages.component.html',
  styleUrl: './../../messages/messages.component.scss',
  imports: [CustomDatePipe, NgIf, NgFor, NgClass, CustomTimePipe, MatIconModule, MatMenuModule, EditorModule]
})
export class ReplyMessagesComponent implements AfterViewInit, OnInit {
  @ViewChild('replyContainer') private replyContainer!: ElementRef<HTMLDivElement>;
  subscription = new Subscription;
  replies!: Message[];
  customDatePipe = new CustomDatePipe();
  currentUser!: User;
  currentContent!: string;
  editingMessageId: string = '';
  currentEditingContent: string = '';
  menuEditMessage: boolean = false;


  public replyEditEditorInit: RawEditorOptions = {
    suffix: '.min',
    menubar: false,
    toolbar_location: 'bottom',
    border: 'none',
    plugins: 'autoresize emoticons link',
    autoresize_bottom_margin: 0,
    max_height: 500,
    placeholder: 'Nachricht an Chat ... ',
    statusbar: false,
    toolbar: 'emoticons',
    entity_encoding: 'raw',
    setup: editor => {
      editor.on('init', () => {
        if (this.editingMessageId) {
          editor.setContent(this.currentEditingContent);
        }
      });
    }
  };

  @Output() hasOpened = new EventEmitter<{ opened: boolean, userId: string }>();


  constructor(public chatService: ChatService, private profileAuth: ProfileAuthentication, public firebaseService: FirebaseService) {

  }

  openProfile(id: string) {
    const opened = true;
    const userId = id
    this.hasOpened.emit({ opened, userId });
  }

  ngOnInit(): void {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if (user) {
        this.currentUser = new User(user);
      }
    })
  }

  ngAfterViewInit() {
    this.subscription.add(this.chatService.messageCount$.subscribe({
      next: (count) => {
        this.scrollToBottom();

      }
    }));
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      if (this.replyContainer && this.replyContainer.nativeElement) {
        const lastMessageElement = this.replyContainer.nativeElement.lastElementChild;
        if (lastMessageElement) {
          lastMessageElement.scrollIntoView({ block: 'end', behavior: 'auto' });
        }
      }
    });
  }

  getList(): Message[] {
    this.replies = this.chatService.replies;
    return this.chatService.replies;
  }

  isCurrentUserSender(sender: string) {
    return sender === this.currentUser.userId;
  }

  isDateDifferent(index: number) {
    if (index === 0) return true; // Die erste Nachricht zeigt immer das Datum an
    const currentDateFormatted = this.customDatePipe.transform(this.replies[index].time);
    const previousDateFormatted = this.customDatePipe.transform(this.replies[index - 1].time);
    return currentDateFormatted !== previousDateFormatted;
  }

  /**
* Extracts the file name from a URL.
* @param {string} url - The URL from which to extract the file name.
* @returns {string} - The extracted file name.
*/
  urlToFileName(url: string): string {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    let fileName = parts[parts.length - 1];
    fileName = fileName.split('?')[0];
    return fileName;
  }


  /**
   * Initiates the file download process from a specified URL.
   * @param {string} url - The URL of the file to download.
   * @param {string} filename - The name to assign to the downloaded file.
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'downloaded-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  }


  formatUsernames(users: string[]): string {
    if (users.length <= 2) {
      return users.join(' und ');
    } else {
      return `${users.slice(0, -1).join(', ')} und ${users[users.length - 1]}`;
    }
  }

  addReaction(messageId: string, emote: string) {
    this.chatService.reactOnMessage(messageId, emote, this.currentUser.name, true)
    this.addToLastReaction(emote);

  }

  addToLastReaction(emote: string) {
    if (emote != this.getReactionEmote1()) {
      this.currentUser.lastReaction2 = this.getReactionEmote1()
      this.currentUser.lastReaction1 = emote
    }
    this.firebaseService.updateLastReaction(this.currentUser.lastReaction1, this.currentUser.lastReaction2, this.currentUser.userId)
  }

  editMessage(id: string, content: string) {
    this.closeEditor();

    this.editingMessageId = id;
    this.currentEditingContent = content;
  }

  closeEditor() {
    const editorInstance = tinymce.get('editData-' + this.editingMessageId);
    if (editorInstance) {
      editorInstance.remove();
    }
    this.editingMessageId = 'editOver';
  }

  // safeMessage(safe: boolean, messageId: string = '') {
  //   if (safe) {
  //     this.chatService.editMessage(messageId, this.getInputContent(tinymce.get('editData-' + messageId)));
  //   }
  //   this.closeEditor();
  // }

  safeMessage(safe: boolean, messageId: string = '') {
    if (safe) {
      const content = this.getInputContent(tinymce.get('editData-' + messageId));
      const message = this.replies.find(msg => msg.messageId === messageId);
      if (message) {
        message.content = content; // Update the message content immediately in the UI
      }
      this.chatService.editReplyMessage(messageId, content);
    }
    this.closeEditor();
  }

  getInputContent(input: any) {
    const content = input.getContent({ format: 'text' });
    return content;
  }

  openEditMessage() {
    this.menuEditMessage = !this.menuEditMessage;
  }


  getReactionEmote1(): string {
    return this.currentUser.lastReaction1 && this.currentUser.lastReaction1 ? this.currentUser.lastReaction1 : '🙌🏻';
  }

  getReactionEmote2(): string {
    return this.currentUser.lastReaction2 && this.currentUser.lastReaction2 ? this.currentUser.lastReaction2 : '✅';
  }
}