import { Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'modalModificarAltaFavorito',
  templateUrl: 'modalModificarAltaFavorito.component.html',
})
export class ModalModificarAltaFavorito {

  modificarFavorito: boolean;

  constructor(
    public dialogRef: MatDialogRef<ModalModificarAltaFavorito>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nombreFavoritoFormControl.setValue(data.favorito.nombre);
      this.modificarFavorito = data.modificarFavorito;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  nombreFavoritoFormControl = new FormControl('', [
    Validators.required
  ]);

  matcher = new MyErrorStateMatcher();

}
