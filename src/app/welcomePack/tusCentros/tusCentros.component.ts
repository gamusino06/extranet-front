import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tusCentros',
  templateUrl: './tusCentros.component.html',
  styleUrls: ['./tusCentros.component.scss']
})
export class TusCentrosComponent implements OnInit {

  user: any;
  tokenRecibido: string;
  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.spinner.show();
    this.activatedRoute.params.subscribe(params => {
      this.spinner.hide();
      if (location.search.indexOf('=') != -1) {
        this.tokenRecibido = location.search.substring(location.search.indexOf('=') + 1);
        this.getUserDataWP();
      } else {
        this.user = JSON.parse(localStorage.getItem('userWP'));
      }
    });
  }

  getUserDataWP() {
    this.spinner.show();
    this.userService.getUserDataWP(this.tokenRecibido).subscribe(user => {
      this.spinner.hide();
      this.user = user;
      localStorage.setItem('userWP', JSON.stringify(this.user));
    })
  }

}
