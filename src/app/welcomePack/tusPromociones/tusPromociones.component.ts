import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../extranet/globals';

@Component({
  selector: 'app-tusPromociones',
  templateUrl: './tusPromociones.component.html',
  styleUrls: ['./tusPromociones.component.scss']
})
export class TusPromocionesComponent implements OnInit {

  @Input() user: any;
  tokenRecibido: string;
  myPromotions: any;

  imgVigilancia= '../../assets/img/'+this.getLang()+'/promocionSPA_VS.png';
  imgPrevencion= '../../assets/img/'+this.getLang()+'/promocionSPA_PT.png';
  imgCalendario= '../../assets/img/'+this.getLang()+'/calendarioFormacion.png';
  imgPrl= '../../assets/img/'+this.getLang()+'/productosPRL.png';
  imgFormacion= '../../assets/img/'+this.getLang()+'/calendarioFormacionBonificada.png';
  imgJuridico= '../../assets/img/'+this.getLang()+'/asesoramientoJuridicoPlus.png';


  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public  globals: Globals,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getUserInfo();
    this.user = JSON.parse(localStorage.getItem('userWP'));
    this.myPromotions = this.user.areas[4].secciones; //carga solo los contactos de la primera empresa
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

  getLang() {
      let lang = localStorage.getItem("lang");
      if (lang == undefined) {
        lang = this.translate.getDefaultLang();
        localStorage.setItem("lang",lang);
      }
      this.translate.use(lang);
      this.translate.setDefaultLang(lang);

      return lang;
  }

}
