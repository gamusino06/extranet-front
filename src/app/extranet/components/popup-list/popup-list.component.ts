import { Component, OnInit, HostListener, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-popup-list',
  templateUrl: './popup-list.component.html',
  styleUrls: ['./popup-list.component.scss']
})
export class PopupListComponent implements OnInit {

  @Input() link: string;
  @Input() title: string;
  @Input() isLoading: boolean;
  @Input() options: any;

  public isOptionsListVisible: boolean;

  constructor(private eRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(this.eRef.nativeElement.contains(event.target)) {
    this.isOptionsListVisible = true;
    } else {
      this.isOptionsListVisible = false;
    }
  }

  showOptions(): void {
    this.isOptionsListVisible = true;
  }

  hideOptions(): void {
    this.isOptionsListVisible = false;
    console.log('Closing...', this.isOptionsListVisible)
  }

  ngOnInit(): void {
    
  }

}
