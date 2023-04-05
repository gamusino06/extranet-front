import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-modal',
  templateUrl: './language-modal.component.html',
  styleUrls: ['./language-modal.component.css']
})
export class LanguageModalComponent implements OnInit {

  @Input() configurationObj: any;
  @Output() onAcceptLanguageEvent = new EventEmitter<boolean>();
  @Output() onCancelLanguageEvent = new EventEmitter<boolean>();

  formLoaded = false;

  selectedLang: any;
  languageList: any[] = [];

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initLanguageList();
    this.formLoaded = true;
  }

  onAccept(): void {
    this.onAcceptLanguageEvent.emit(this.selectedLang);
  }

  onCancel(): void {
    this.onCancelLanguageEvent.emit();
  }
  setSelectedLang(language: string): void {
    this.selectedLang = language;
    this.languageList.forEach(lang => {
      lang.checked = false;
      if (lang.code === language) {
        lang.checked = true;
      }
    });
  }
  initLanguageList(): void {
    this.translate.getLangs().forEach(lang => {
      const langObj = {
        code: lang,
        checked: false
      };
      if (lang === this.translate.getDefaultLang()) {
        langObj.checked = true;
      };
      this.languageList.push(langObj);
    });
  }

}
