import {
  Directive,
  Input,
  OnChanges,
  HostBinding,
  ElementRef,
} from '@angular/core';

/*
(220 - age) * 0.6 = lower heart rate range
(220 - age) * 0.75 = upper heart rate range

below lower hr range -> blue card
between hr range -> green card
beyong upper hr range -> red card
0 hr or other -> grey card
*/

@Directive({
  selector: '[appCardColor]',
})
export class CardColorDirective implements OnChanges {
  @Input('appCardColor') personnel;
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
  @HostBinding('class.bg-gray') get gray(): boolean {
    return this.color === 'gray';
  }

  private color: string;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes) {
    this.color = this.getColor();
  }

  getColor(): string {
    const today = new Date();
    let age = 40,
      birthday = new Date();

    if (this.personnel && this.personnel['birthday']) {
      birthday = new Date(this.personnel['birthday']);
      age = today.getFullYear() - birthday.getFullYear();
    }

    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }

    const lowerHR = (220 - age) * 0.6;
    const upperHR = (220 - age) * 0.75;
    const lowestHR = 40;
    let colorClass = '';

    if (!this.personnel || !this.personnel.hr || this.personnel.hr === 0) {
      colorClass = 'gray';
    } else if (this.personnel.hr < lowestHR) {
      colorClass = 'red';
    } else if (this.personnel.hr < lowerHR) {
      colorClass = 'blue';
    } else if (this.personnel.hr < upperHR) {
      colorClass = 'green';
    } else if (this.personnel.hr > upperHR) {
      colorClass = 'orange';
    } else {
      colorClass = 'gray';
    }
    return colorClass;
  }
}
