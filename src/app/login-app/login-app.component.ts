import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-app',
  templateUrl: './login-app.component.html',
  styleUrls: ['./login-app.component.css']
})
export class LoginAppComponent implements OnInit {

  imgUrl = '../assets/img/CrossBanner.png';
  logoUrl = '../assets/img/logo.svg';
  logoWhiteUrl = '../assets/img/logoPrevingWhite.svg';

  constructor() { }

  ngOnInit(): void {
  }

}
