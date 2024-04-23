import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CustomDatePipe } from '../../messages/date-pipe/custom-date.pipe';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';
import { Subscription } from 'rxjs';
import { Message } from '../../../../../assets/models/message.class';
import { User } from '../../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../../assets/services/profileAuth.service';
import { CustomTimePipe } from '../../messages/time-pipe/custom-time.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-reply-messages',
  standalone: true,
  templateUrl: './reply-messages.component.html',
  styleUrl: './../../messages/messages.component.scss',
  imports: [
    CustomDatePipe,
    NgIf,
    NgFor,
    NgClass,
    CustomTimePipe,
    MatIconModule,
    MatMenuModule,
  ],
})
export class ReplyMessagesComponent implements AfterViewInit, OnInit {
  @ViewChild('replyContainer')
  private replyContainer!: ElementRef<HTMLDivElement>;
  subscription = new Subscription();
  replies!: Message[];
  customDatePipe = new CustomDatePipe();
  currentUser!: User;
  currentContent!: string;

  @Output() hasOpened = new EventEmitter<{opened: boolean, userId: string}>();

  constructor(
    public chatService: ChatService,
    private profileAuth: ProfileAuthentication
  ) {}

  ngOnInit(): void {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if (user) {
        this.currentUser = new User(user);
      }
    });
  }

  openProfile(id: string) {
    const opened = true;
    const userId = id
    this.hasOpened.emit({opened, userId});
  }

  ngAfterViewInit() {
    this.subscription.add(
      this.chatService.messageCount$.subscribe({
        next: (count) => {
          this.scrollToBottom();
        },
      })
    );
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      if (this.replyContainer && this.replyContainer.nativeElement) {
        const lastMessageElement =
          this.replyContainer.nativeElement.lastElementChild;
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
    const currentDateFormatted = this.customDatePipe.transform(
      this.replies[index].time
    );
    const previousDateFormatted = this.customDatePipe.transform(
      this.replies[index - 1].time
    );
    return currentDateFormatted !== previousDateFormatted;
  }

  addReaction(messageId: string, emote: string) {
    this.chatService.reactOnMessage(
      messageId,
      emote,
      this.currentUser.name,
      true
    );
  }

  formatUsernames(users: string[]): string {
    if (users.length <= 2) {
      return users.join(' und ');
    } else {
      return `${users.slice(0, -1).join(', ')} und ${users[users.length - 1]}`;
    }
  }
}
