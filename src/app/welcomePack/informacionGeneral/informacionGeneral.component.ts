import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../extranet/globals';

@Component({
  selector: 'app-informacionGeneral',
  templateUrl: './informacionGeneral.component.html',
  styleUrls: ['./informacionGeneral.component.css']
})
export class InformacionGeneralComponent implements OnInit {

  @Input() user: any;
  tokenRecibido: string;

  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private router: Router,
    public translate: TranslateService,
    public globals: Globals
  ) { }

  ngOnInit() {
    // this.user=JSON.parse(localStorage.getItem('userWP'));
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

  goToPrimeraPassword() {
    this.router.navigate([this.globals.primeraPassword]);
  }
}
