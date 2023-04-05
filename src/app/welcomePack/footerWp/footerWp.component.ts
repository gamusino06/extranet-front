import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footerWp',
  templateUrl: './footerWp.component.html',
  styleUrls: ['./footerWp.component.css']
})
export class FooterWpComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

}
