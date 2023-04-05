import { Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']

})

export class ProgressBarComponent {
  
  @Input() step: any[];

  constructor() {}

}