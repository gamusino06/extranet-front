import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {TranslateService} from '@ngx-translate/core';
import { element } from 'protractor';
import * as XLSX from 'xlsx';

export enum COLUMN_NAME {
    NIF_EXCEL,
    NAME_EXCEL,
    LASTNAME_EXCEL,
    BIRTH_DATE_EXCEL,
    INIT_DATE_EXCEL,
    END_DATE_EXCEL,
    MODALITY_EXCEL,
    COURSE_NAME_EXCEL,
    HOURS_EXCEL,
    CENTER_NAME_EXCEL,
    FORMATION_TYPE_EXCEL,
    EVALUATION_EXCEL,
    RECYCLING_DATE_EXCEL
}


@Component({
    selector: 'app-massive-error',
    templateUrl: './massive-error.component.html',
    styleUrls: ['./massive-error.component.css'],
    providers: [],
})


export class MassiveErrorComponent implements OnInit {
    displayedColumns: string[] = ['line', 'description', 'reason'];
    dataSource = new MatTableDataSource<any>();

    constructor(public dialogRef: MatDialogRef<MassiveErrorComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                public translate: TranslateService,
    ) {
    }

    ngOnInit(): void {
        this.translateColumn(this.data);
    }

    translateColumn(data) {
        const newError = [];
        data.forEach(obj => {
            // if (obj.required === true) {
            //     newError.push({
            //         line: obj.line + 1 ,
            //         column: this.translateColumnName(COLUMN_NAME[obj.column]),
            //         error: this.translateColumnName2(obj, true)
            //     });
            // }
            newError.push({
                    line: obj.line + 1 ,
                    column: this.translateColumnName(COLUMN_NAME[obj.column]),
                    error: this.translateColumnName2(obj, true)
                });
        });
        const result = newError.sort((b, a) => a.line + b.line);
        this.dataSource = new MatTableDataSource(result);
    }
    translateColumnName(columnName) {
        let value = columnName;
        this.translate.get(columnName).subscribe((res: string) => {
            value = res;
        });
        return value;
    }

    translateColumnName2(obj, bold) {
        const boldLabel = '<b>'
        const boldLabel2 = '</b>'
        const column = this.translateColumnName(COLUMN_NAME[obj.column])
        let value = null;
        const example = obj.correctValueExample ? obj.correctValueExample.toString() : null;
        if (bold) {
            this.translate.get(obj.errorLog, {
                field: boldLabel + column + boldLabel2,
                value: boldLabel + obj.currentValue + boldLabel2,
                example: boldLabel + example + boldLabel2
            }).subscribe((res: string) => {
                value = res;
            });
        } else {
            this.translate.get(obj.errorLog, {
                field: column,
                value: obj.currentValue,
                example: example
            }).subscribe((res: string) => {
                value = res;
            });
        }

        return value;
    }

    cancel() {
        this.dialogRef.close();
    }

    downloadLog2() {
        const FileSaver = require('file-saver');
        const blob = new Blob([JSON.stringify(this.data)], {type: 'text/csv;charset=utf-8'});
        FileSaver.saveAs(blob, 'log.json');
    }

    downloadLog() {
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        let workSheet: XLSX.WorkSheet;
        const dataJS = [];

        let nombreExcel = 'SubidaMasivaErrores';
        const newLogFile = [];
        let requiredTrue;
        this.translate.get('REQUIRED_TRUE').subscribe((res: string) => {
            requiredTrue = res;
        });
        let requiredFalse;
        this.translate.get('REQUIRED_FALSE').subscribe((res: string) => {
            requiredFalse = res;
        });
        this.data.forEach(obj => {
            newLogFile.push({
                line: obj.line + 1,
                column: this.translateColumnName(COLUMN_NAME[obj.column]),
                error: this.translateColumnName2(obj, false),
                required: obj.required === true ? requiredTrue : requiredFalse
            });
        });
        const result = XLSX.utils.sheet_add_json(workSheet, newLogFile);
        XLSX.utils.book_append_sheet(wb, result, 'errors');
        XLSX.writeFile(wb, nombreExcel + '.xlsx');

    }
}
