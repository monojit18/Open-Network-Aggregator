import { Pipe, PipeTransform } from '@angular/core';

const defaultTrailing = '…';
const defaultLength = 40;

// ex 2:- <span>{{ "123456789" | saTruncatePipe : 20 : '...' : true : true }}</span> //option[3] if want to check screen width
// ex 3:- <span>{{ "123456789" | saTruncatePipe : 20 }}</span> /
@Pipe({
  name: 'truncatePipe',
  pure: true,
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  screenWidth;
  constructor() {
    this.screenWidth = window.innerWidth;
  }
  transform(value: string, ...options: any): string {
    let limit = options[0] || defaultLength;
    if (options[3]) {
      if (this.screenWidth > 1365 && limit <= 25) {
        limit = defaultLength;
      }
    }

    let trailingString = '';
    let countTrailing = false;

    if (!value) {
      value = '';
    }
    if (options && options[1] && typeof options[1] === 'object') {
      trailingString = options[1].trailingString || defaultTrailing;
      countTrailing = options[1].countTrailing || false;
    } else {
      trailingString = options[1] || defaultTrailing;
      countTrailing = options[2] || false;
    }

    let stringLength = this.getStringLength(
      limit,
      trailingString,
      countTrailing
    );

    if (stringLength < 0) {
      stringLength *= -1;
      return value.length > stringLength
        ? trailingString +
            value.substring(value.length - stringLength, value.length)
        : value;
    } else {
      return value.length > stringLength
        ? value.substring(0, stringLength) + trailingString
        : value;
    }
  }

  private getStringLength(limit: number, trail: string, countTrailing = false) {
    if (countTrailing) {
      if (limit < 0) {
        return limit + trail.length;
      } else {
        return limit - trail.length;
      }
    }

    return limit;
  }
}
