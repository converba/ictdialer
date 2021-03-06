import { DataSource } from '@angular/cdk/collections';
import { TransmissionDatabase } from './transmission-database.component';
import { Transmission } from './transmission';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatPaginator } from '@angular/material';
import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { MatSortHeaderIntl } from '@angular/material';

import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

export class TransmissionDataSource extends DataSource<Transmission> {

  constructor(private transmissionDatabase: TransmissionDatabase, private _sort: MatSort, private _paginator: MatPaginator) {
    super();
  }

  connect(): Observable<Transmission[]> {
    const displayDataChanges = [
      this.transmissionDatabase.dataChange,
      this._sort.sortChange,
      this._paginator.page,
    ];
    return Observable.merge(...displayDataChanges)
    .map(() => this.getSortedData())
    .map(data => this.paginate(data));
  }

  disconnect() { }
  getSortedData(): Transmission[] {
    const data = this.transmissionDatabase.data.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a , b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'ID': [propertyA, propertyB] = [a.transmission_id, b.transmission_id]; break;
        case 'contact_id': [propertyA, propertyB] = [a.contact_id, b.contact_id]; break;
        case 'type': [propertyA, propertyB] = [a.program_type, b.program_type]; break;
        case 'title': [propertyA, propertyB] = [a.title, b.title]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) *
      (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

  paginate(data) {
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    return data.splice(startIndex, this._paginator.pageSize);
  }
}
