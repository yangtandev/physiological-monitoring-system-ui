import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-battery',
  templateUrl: './battery.component.html',
  styleUrls: ['./battery.component.scss']
})
export class BatteryComponent implements OnInit {
  @Input() battery: Number;
  imgSrc: String;
  constructor() { }

  ngOnInit(): void {

    if (this.battery == 100) {
      this.imgSrc = 'assets/img/battery_full.svg'
    } else if (this.battery >= 90) {
      this.imgSrc = 'assets/img/battery_90.svg'
    } else if (this.battery >= 80) {
      this.imgSrc = 'assets/img/battery_80.svg'
    } else if (this.battery >= 60) {
      this.imgSrc = 'assets/img/battery_60.svg'
    } else if (this.battery >= 50) {
      this.imgSrc = 'assets/img/battery_50.svg'
    } else if (this.battery >= 30) {
      this.imgSrc = 'assets/img/battery_30.svg'
    } else if (this.battery >= 20) {
      this.imgSrc = 'assets/img/battery_20.svg'
    } else {
      this.imgSrc = 'assets/img/battery_alert.svg'
    }

  }

}
