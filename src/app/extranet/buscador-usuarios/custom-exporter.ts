import {Exporter, Options, CsvExporterService} from 'mat-table-exporter';

export class CustomExporter extends CsvExporterService{

private static readonly BOM = "\uFEFF";

// Override
public createContent(rows: Array<any>, options?: Options): any {
  return CustomExporter.BOM + super.createContent(rows, options);
}

}
