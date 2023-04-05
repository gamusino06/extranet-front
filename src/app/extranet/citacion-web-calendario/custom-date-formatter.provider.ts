import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  // you can override any of the methods defined in the parent class

  public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
      let dayText = formatDate(date, 'EEE', locale).charAt(0).toUpperCase() + formatDate(date, 'EEE', locale).substr(1).toLowerCase()
      return dayText;
  }

  public monthViewTitle({ date, locale }: DateFormatterParams): string {
    let monthText = formatDate(date, 'MMMM y', locale).charAt(0).toUpperCase() + formatDate(date, 'MMMM y', locale).substr(1).toLowerCase()
    return monthText;
  }

  public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
      let dayText = formatDate(date, 'EEE', locale).charAt(0).toUpperCase() + formatDate(date, 'EEE', locale).substr(1).toLowerCase()
      return dayText;
  }

  public dayViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale);
  }

}
