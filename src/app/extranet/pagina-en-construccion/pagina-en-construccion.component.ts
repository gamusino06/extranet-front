import { Idioma } from './../../Model/Idioma';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-pagina-en-construccion',
  templateUrl: './pagina-en-construccion.component.html',
  styleUrls: ['./pagina-en-construccion.component.css']

})
export class PaginaEnContruccionComponent implements OnInit {
  hide1: boolean = true;
  hide2: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) {

  }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
  }

  onSubmit(): void {

  }
}
