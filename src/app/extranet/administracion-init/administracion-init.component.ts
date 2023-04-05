import { Idioma } from './../../Model/Idioma';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { OffersService } from 'src/app/services/offers.service';

@Component({
  selector: 'app-administracion-init',
  templateUrl: './administracion-init.component.html',
  styleUrls: ['./administracion-init.component.css']

})
export class AdministracionInitComponent implements OnInit {
  hide1: boolean = true;
  hide2: boolean = true;

  val: number = null;

  constructor(
    private offersService: OffersService,
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
    this.offersService.getValue().subscribe((value) => {
      this.val = value
      console.log(value);
    });
    this.initNotAcceptedOffers();
    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });
    }

    if(screen.width < 1530){
      $(document).ready(function(){
        $('mat-tab-list').css('transform','translateX(-430px)');
      });
    }
  }

  initNotAcceptedOffers(): void{
    this.offersService.getCountNotAcceptedOffers().subscribe((val) => {
      console.log(val)
      this.offersService.setValue(val)
    })
  }

  onSubmit(): void {

  }
}
