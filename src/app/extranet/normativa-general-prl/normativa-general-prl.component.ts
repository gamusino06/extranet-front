import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {isUndefined} from 'util';

@Component({
  selector: 'app-normativa-general-prl',
  templateUrl: './normativa-general-prl.component.html',
  styleUrls: ['./normativa-general-prl.component.css']
})
export class NormativaGeneralPrlComponent implements OnInit {

  constructor(private router: Router) {
    this.sacarId();
  }

  ngOnInit(): void {
  }

  sacarId(){
    if(!sessionStorage.getItem('customerId') || isUndefined(sessionStorage.getItem('customerId')))
      this.router.navigate(['extranet/juridico']);
  }

  get numeroCustomers(){
    return sessionStorage.getItem('customerQuantities');
  }
}
