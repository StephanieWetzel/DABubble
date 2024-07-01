import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true,
  pure: true
})
export class CustomDatePipe implements PipeTransform {

  today: Date = new Date();
  yesterday: Date = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);


  transform(value: number): string {
    const inputDate = new Date(value);

    if (this.isSameDay(inputDate, this.today)) {
      return 'Heute';
    } else if (this.isSameDay(inputDate, this.yesterday)) {
      return 'Gestern';
    } else {
      return this.formatDate(inputDate);
    }
  }


  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }


  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    };
    return date.toLocaleDateString('de-DE', options);
  }
}