import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customTime',
  standalone: true
})
export class CustomTimePipe implements PipeTransform {

  /**
 * Transforms a timestamp into a formatted time string.
 *
 * @param {number} timestamp - The timestamp to transform, in milliseconds since the Unix epoch.
 * @returns {string} - The formatted time string in the format "HH:MM".
 */
  transform(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}