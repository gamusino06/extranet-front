import { values } from './../../mocks/table-value-mock';
import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit {

  environment = environment;
  loading = false;
  submitted = false;
  value: any;
  data: any;

  /*formularios*/
  loginForm: FormGroup;

  constructor(
    private modal: MatDialog,
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    /*form Builder*/
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.spinner.show();
    this.userService.resetPassword(this.loginForm.value.email).subscribe(data => {
      this.data = data;
      this.spinner.hide();
      if (data){
        let titulo = "Solicitud aceptada";
        this.translate.get('SOLICITUD_ACEPTADA').subscribe((res: string) => {
           titulo = res;
        });
        let texto = "Hemos enviado un email con las instrucciones que debes seguir";
        this.translate.get('INSTRUCCIONES_A_SEGUIR').subscribe((res: string) => {
           texto = res;
        });
        this.utils.mostrarMensajeSwalFire('success', titulo, texto,'var(--blue)', false);
      }
      //error captado en service-generic
    }),(error => {
      if (environment.debug) console.log("Error aL ENVIAR EMAIL");
    });
    this.loading = true;
    this.cerrarModal();
  }

  cerrarModal() {
    this.modal.closeAll();
  }

}


