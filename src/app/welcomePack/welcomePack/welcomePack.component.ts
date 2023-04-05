import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-welcomePack',
  templateUrl: './welcomePack.component.html',
  styleUrls: ['./welcomePack.component.scss']
})
export class WelcomePackComponent implements OnInit {

  isInfo: boolean;
  isCentros: boolean;
  isDocs: boolean;
  isProfesionales: boolean;
  isPromos: boolean;

  tokenRecibido: string;
  user:any;

  navegacionUrl: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) {

    if (this.router.url.includes("/welcomepack/informaciongeneral")) {
      this.isInfo = true;
    } else if (this.router.url == "/welcomepack/informaciongeneral"){
      this.isInfo = true;
    } else if (this.router.url == "/welcomepack/centros") {
      this.isCentros = true;
    } else if (this.router.url == "/welcomepack/documentos") {
      this.isDocs = true;
    } else if (this.router.url == "/welcomepack/profesionales") {
      this.isProfesionales = true;
    } else if (this.router.url == "/welcomepack/promociones") {
      this.isPromos = true;
    }
  }

  /* cuando haga click*/
  /*se activa el route.navigate('urquesea)*/

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo()
{
  this.spinner.show();
  this.activatedRoute.params.subscribe(params => {
    this.spinner.hide();
    if(location.search.indexOf('=')!=-1){
      this.tokenRecibido = location.search.substring(location.search.indexOf('=') + 1);
      localStorage.setItem('token',this.tokenRecibido);
      this.getUserDataWP();
    } else{
      this.user=JSON.parse(localStorage.getItem('userWP'));
      if (this.translate.getDefaultLang()!==this.user?.idioma?.lang)
      {
        this.translate.use(this.user?.idioma?.lang);
        this.translate.setDefaultLang(this.user?.idioma?.lang);
      }
    }
  });
}

  getUserDataWP(){
    this.spinner.show();
    this.userService.getUserDataWP(this.tokenRecibido).subscribe(user =>{
      this.spinner.hide();
      this.user=user;
      localStorage.setItem('userWP', JSON.stringify(this.user));
      if (this.translate.getDefaultLang()!==this.user?.idioma?.lang)
      {
        this.translate.use(this.user?.idioma?.lang);
        this.translate.setDefaultLang(this.user?.idioma?.lang);
      }
    });
  }
}
