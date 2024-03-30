import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    const date = new Date(value); // Umwandlung von Sekunden in Millisekunden
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', 
      day: '2-digit', 
      month: 'long'
    };
    return date.toLocaleDateString('de-DE', options);
  }

}
