import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-headerWp',
  templateUrl: './headerWp.component.html',
  styleUrls: ['./headerWp.component.css']
})
export class HeaderWpComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

}
