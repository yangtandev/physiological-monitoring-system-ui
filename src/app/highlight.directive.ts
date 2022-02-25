import {
  Directive,
  Input,
  OnChanges,
  HostBinding,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Observable, timer } from 'rxjs';
@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') personnel;

  @HostBinding('class.bg-blue') get blue(): boolean {
    return this.color === 'blue';
  }
  @HostBinding('class.bg-red') get red(): boolean {
    return this.color === 'red';
  }
  @HostBinding('class.bg-green') get green(): boolean {
    return this.color === 'green';
  }
  @HostBinding('class.bg-orange') get orange(): boolean {
    return this.color === 'orange';
  }
  @HostBinding('class.bg-brown') get deepOrange(): boolean {
    return this.color === 'brown';
  }
  @HostBinding('class.bg-gray') get gray(): boolean {
    return this.color === 'gray';
  }
  @HostBinding('class.custom-color1') get myColor1(): boolean {
    return this.color === '#002fff';
  }
  private color: string;

  constructor(private el: ElementRef) {
    //el.nativeElement.style.backgroundColor = 'yellow';
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight('yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {}

  private highlight(color: string) {
    //this.el.nativeElement.style.backgroundColor = color;
  }

  ngOnChanges(changes) {
    this.color = this.getColor();
    //this.el.nativeElement.style.backgroundColor= this.getColor();
  }

  getColor(): string {
    let age = 40;
    if (this.personnel) {
      const current = new Date();
      const birthday = new Date(parseInt(this.personnel['birthday'], 10));
      age = current.getFullYear() - birthday.getFullYear();
      const month_difference = current.getMonth() - birthday.getMonth();
      if (
        month_difference < 0 ||
        (month_difference === 0 && current.getDate() < birthday.getDate())
      ) {
        age--;
      }
    }
    const maxHr = 206.9 - 0.67 * age;
    const moderate = this.personnel.hr > maxHr * 0.5;
    const intense = this.personnel.hr > maxHr * 0.7;
    const excessive = this.personnel.hr > maxHr * 0.85;
    const low = this.personnel.hr < 40;

    let colorClass = '';
    if (
      this.personnel &&
      this.personnel.hr > 0 &&
      Date.now() - this.personnel.timestamp <= 10000
    ) {
      if (
        low ||
        excessive ||
        this.personnel.temperature >= 37.5 ||
        this.personnel.temperature == 195.67
      ) {
        colorClass = 'red';
      } else if (intense) {
        colorClass = 'brown';
      } else if (moderate) {
        colorClass = 'green';
      } else {
        colorClass = 'blue';
      }
    } else {
      colorClass = 'gray';
      this.personnel['hr'] = 0;
      this.personnel['hrr'] = 0;
      this.personnel['rmssd'] = 0;
      this.personnel['sdnn'] = 0;
      this.personnel['frequency'] = 0;
    }
    return colorClass;
  }
}
