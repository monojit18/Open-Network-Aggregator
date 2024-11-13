import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
import { TranslateModule } from '@ngx-translate/core';

export interface RecordsModel {
  Arrival_Date: String;
  Commodity: String;
  Commodity_Code: String;
  District: String;
  Grade: String;
  Market: String;
  Max_Price: String;
  Min_Price: String;
  Modal_Price: String;
  State: String;
  Variety: String;
}
@Component({
  selector: 'app-agri',
  standalone: true,
  imports: [CommonModule, MatTableModule, GenTranslatePipe, TranslateModule],
  templateUrl: './agri.component.html',
  styleUrl: './agri.component.scss',
})
export class AgriComponent implements OnInit {
  @Input() message: any;
  tableData: RecordsModel[];
  displayedColumns: string[] = [
    'Commodity',
    'District',
    // 'State',
    'Market',
    'Min_Price',
    'Max_Price',
  ];
  ngOnInit(): void {
    this.tableData = this.message.message.records.slice(0, 10);
  }
}
