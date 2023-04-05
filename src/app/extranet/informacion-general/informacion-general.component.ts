import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {isNull, isUndefined} from 'util';
import {CustomerService} from '../../services/customer.service';
import {FormBuilder} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {UtilsService} from '../../services/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../globals';
@Component({
  selector: 'app-informacion-general',
  templateUrl: './informacion-general.component.html',
  styleUrls: ['./informacion-general.component.css']
})
export class InformacionGeneralComponent implements OnInit {

  lang: string=this.translate.getDefaultLang();
  informacion: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef,
    public utils: UtilsService,
    public translate: TranslateService,
    public globals: Globals,
    private customerService: CustomerService
  ) {
    this.sacarId();
  }

  ngOnInit(): void {
    this.getInformacion();
  }

  ngAfterViewChecked() {
    let swLangChange = 0;
    if(this.translate.getDefaultLang() != this.lang) {
      this.lang = this.translate.getDefaultLang();
      swLangChange = 1;
    }

    if(swLangChange == 1){
      this.getInformacion()
    }
  }

  sacarId(){
    if(!sessionStorage.getItem('customerId') || isUndefined(sessionStorage.getItem('customerId')))
      this.router.navigate(['extranet/juridico']);
  }

  getInformacion(){
    this.spinner.show();
    let idioma = this.translate.getDefaultLang();
    if(idioma != 'es-CA')
      idioma = 'es';
    else
      idioma = 'ca';

    this.customerService.getInformacion(sessionStorage.getItem('customerId'), idioma)
      .subscribe(data => {
        if(data != null) {
          this.informacion = data.text;
          this.spinner.hide();
        } else {
          this.informacion = '';
          this.spinner.hide();
        }
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener la información", '','var(--blue)', false);
        this.spinner.hide();
      });
  }

  get numeroCustomers(){
    return sessionStorage.getItem('customerQuantities');
  }

}
