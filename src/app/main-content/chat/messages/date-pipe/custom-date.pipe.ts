import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {

  transform(value: number): string {
    const inputDate = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1)

    const inputDateString = inputDate.toLocaleDateString('de-DE');
    const todayString = today.toLocaleDateString('de-DE');
    const yesterdayString = yesterday.toLocaleDateString('de-DE');

    if (inputDateString === todayString) {
      return 'Heute';
    } else if (inputDateString === yesterdayString) {
      return 'Gestern';
    }else{
      const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', 
      day: '2-digit', 
      month: 'long'
    };
    return inputDate.toLocaleDateString('de-DE', options);
    }

    
  }
}
