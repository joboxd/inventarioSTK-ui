import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Apis } from "../../../service/apis/apis";
import { Activo, ContentActivos } from '../../../models/Activo';
import { KeycloackService } from "../../../service/keycloak/keycloak"
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgStyle, NgClass } from '@angular/common';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'tableMaterial',
  styleUrl: 'tableMaterial.css',
  templateUrl: 'tableMaterial.html',
  imports: [MatTableModule, MatPaginatorModule, 
    MatSortModule, MatInputModule, MatFormFieldModule, NgStyle, NgClass],
})
export class TablePaginationExample implements AfterViewInit, OnInit {
  ngOnInit() {
    this.getAllActivos();
  }

  private _liveAnnouncer = inject(LiveAnnouncer);
  private api = inject(Apis);
  private keycloak = inject(KeycloackService)
  displayedColumns: string[] = ['id', 'numeroSerie', 'marcaModelo', 'estado', 'costoAdquisicion', 'fechaIngreso', 'categoria', 'folioInventario'];
  dataSource = new MatTableDataSource<Activo>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  //**Gestion de ordenamiento*/
  announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  //gestionador de filtros
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  getAllActivos() {
    console.log(this.keycloak.getToken());

    this.api.getAllActivos().subscribe({
      next: (data: ContentActivos) => {
        // Al asignar el arreglo a .data, la tabla de Material se actualiza automáticamente
        this.dataSource.data = data.content;
      },
      error: (err) => {
        console.error('Ocurrió un error al cargar el inventario', err);
        // Aquí podrías mostrar un mensaje de error en pantalla
      }
    })
  }
  formatPrice(amount: number): string {
    return Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  getRow(activo: Activo){
    console.log(activo);
    
  }
}

