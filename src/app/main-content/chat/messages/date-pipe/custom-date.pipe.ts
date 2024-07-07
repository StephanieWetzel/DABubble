import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true,
  pure: true
})
export class CustomDatePipe implements PipeTransform {

  today: Date = new Date();
  yesterday: Date = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);


  /**
 * Transforms a timestamp into a human-readable date string.
 * Returns 'Heute' if the date is today, 'Gestern' if it was yesterday,
 * and a formatted date string otherwise.
 *
 * @param {number} value - The timestamp to transform, in milliseconds since the Unix epoch.
 * @returns {string} - The transformed date string.
 */
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


  /**
 * Checks if two dates are the same day.
 *
 * @param {Date} date1 - The first date to compare.
 * @param {Date} date2 - The second date to compare.
 * @returns {boolean} - True if the dates are the same day, otherwise false.
 */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }


  /**
 * Formats a date into a string with the format "weekday, day month".
 *
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    };
    return date.toLocaleDateString('de-DE', options);
  }
}