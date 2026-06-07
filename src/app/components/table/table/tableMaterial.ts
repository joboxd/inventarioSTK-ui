import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Apis } from "../../../service/apis/apis";
import { Activo, ContentActivos } from '../../../models/Activo';
import { KeycloackService } from "../../../service/keycloak/keycloak"
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { NgStyle, NgClass } from '@angular/common';
import { Filtros } from '../../../models/Filtros';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'tableMaterial',
  styleUrl: 'tableMaterial.css',
  templateUrl: 'tableMaterial.html',
  imports: [MatTableModule, MatPaginatorModule,
    MatSortModule, MatInputModule, MatFormFieldModule,
    NgStyle, NgClass, MatSelectModule],
})
export class TablePaginationExample implements AfterViewInit, OnInit {
  ngOnInit() {
    this.getAllActivos();
  }

  private _liveAnnouncer = inject(LiveAnnouncer);
  private api = inject(Apis);
  private keycloak = inject(KeycloackService)
  private filtros: Filtros = {}
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
  //gestionador de filtros internos
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  getInputFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    const label = (event.target as HTMLInputElement).labels?.[0]?.innerText || '';

    switch (label) {
      case "Numero de Serie":
        this.filtros.numeroSerie = filterValue
        break;
      case "Marca o Modelo":
        this.filtros.marcaModelo = filterValue
        break;
      case "Categoria":
        this.filtros.categoria = filterValue
        break;
      case "Costo minimo":
        this.filtros.minConsto = Number(filterValue)
        break;
      case "Consto maximo":
        this.filtros.maxCosto = Number(filterValue)
        break;
      default:
        break;
    }


  }
  getInputFilterSelector(event: MatSelectChange) {
    const value = event.value;
    this.filtros.estado = value;

  }
  getAllActivos() {

    this.api.getAllActivos().subscribe({
      next: (data: ContentActivos) => {
        this.dataSource.data = data.content;
      },
      error: (err) => {
        console.error('Ocurrió un error al cargar el inventario', err);
      }
    })
  }
  formatPrice(amount: number): string {
    return Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  getRow(activo: Activo) {
    console.log(activo);

  }
  onlyNumers(event: KeyboardEvent) {
    const pattern = /[0-9.]/;
    const target = String.fromCharCode(event.charCode);

    if (!pattern.test(target)) {
      event.preventDefault();
    }
  }
  getActivosByFilters() {
    this.api.getActivosFiltered(this.filtros).subscribe({
      next: (data: ContentActivos) => {
        this.dataSource.data = data.content;
      },
      error: (err) => {
        console.error('Ocurrió un error al cargar el inventario', err);
      }
    })
  }
}

