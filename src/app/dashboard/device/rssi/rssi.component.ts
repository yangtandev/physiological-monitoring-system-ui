import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-rssi',
  templateUrl: './rssi.component.html',
  styleUrls: ['./rssi.component.scss']
})
export class RssiComponent implements OnInit {
  @Input() rssi: number;
  imgSrc: String;
  constructor() { }

  ngOnInit(): void {
    if (this.rssi > -55) {
      this.imgSrc = 'assets/img/wifi_4.svg'
    } else if (this.rssi > -75) {
      this.imgSrc = 'assets/img/wifi_3.svg'
    } else if (this.rssi > -85) {
      this.imgSrc = 'assets/img/wifi_2.svg'
    } else if (this.rssi > -95) {
      this.imgSrc = 'assets/img/wifi_1.svg'
    } else {
      this.imgSrc = 'assets/img/wifi_0.svg'
    }
  }

}
