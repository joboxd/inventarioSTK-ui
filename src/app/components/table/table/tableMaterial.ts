import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectorRef, AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Apis } from "../../../service/apis/apis";
import { Activo, Categoria, ContentActivos } from '../../../models/Activo';
import { KeycloackService } from "../../../service/keycloak/keycloak"
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { NgStyle, NgClass } from '@angular/common';
import { Filtros } from '../../../models/Filtros';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ReporteResponse } from '../../../models/ReporteResponse';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import Swal from 'sweetalert2'

/**
 * @title Table with pagination
 */
@Component({
  selector: 'tableMaterial',
  styleUrl: 'tableMaterial.css',
  templateUrl: 'tableMaterial.html',
  imports: [MatTableModule, MatPaginatorModule,
    MatSortModule, MatInputModule, MatFormFieldModule,
    NgStyle, NgClass, MatSelectModule, MatButtonModule,
    MatTabsModule, MatIconModule, MatProgressSpinner, MatToolbarModule],
})
export class TablePaginationExample implements AfterViewInit, OnInit {
  ngOnInit() {
    this.getAllActivos();
    this.getCategorias();
    console.log(this.currentRole);

  }
  private _liveAnnouncer = inject(LiveAnnouncer);
  private cdr = inject(ChangeDetectorRef);
  private api = inject(Apis);
  currentRole = inject(KeycloackService).getRoles()[0];
  keycloak = inject(KeycloackService);
  filtros: Filtros = {}
  activoFoundByNumSerie: boolean = false;
  categorias: Categoria[] = [];
  activoToSave: Activo = {
    id: '',
    folioInventario: '',
    numeroSerie: '',
    marcaModelo: '',
    estado: 'DISPONIBLE',
    costoAdquisicion: 0,
    fechaIngreso: undefined,
    categoria: '',
    categoriaId: 0
  };
  currentTab: number = 1;
  protected readonly showProgressBusquda = signal(false);
  protected readonly showProgressReporte = signal(false);

  displayedColumns: string[] = ['id', 'numeroSerie', 'marcaModelo', 'estado', 'costoAdquisicion', 'fechaIngreso', 'categoria', 'folioInventario'];
  dataSource = new MatTableDataSource<Activo>();


  @ViewChild(MatPaginator) set paginator(mp: MatPaginator) {
    if (mp) {
      this.dataSource.paginator = mp;
    }
  }

  @ViewChild(MatSort) set sort(ms: MatSort) {
    if (ms) {
      this.dataSource.sort = ms;
    }
  }

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
  getInputFilterSelectorEstado(event: MatSelectChange) {
    const value = event.value;
    this.filtros.estado = value;
  }
  getInputFilterSelectorCategoria(event: MatSelectChange) {
    const value = event.value;
    this.filtros.categoria = value;
  }
  getInputToSave(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    const label = (event.target as HTMLInputElement).labels?.[0]?.innerText || '';
    this.activoToSave.fechaIngreso = new Date;
    switch (label) {
      case "Numero de Serie":
        this.activoToSave.numeroSerie = filterValue
        break;
      case "Marca o Modelo":
        this.activoToSave.marcaModelo = filterValue
        break;
      case "Categoria":
        this.activoToSave.categoriaId = Number(filterValue)
        break;
      case "Costo":
        this.activoToSave.costoAdquisicion = Number(filterValue)
        break;

      default:
        break;
    }


  }
  getInputToSaveSelector(event: MatSelectChange) {
    const value = event.value;
    this.activoToSave.estado = value;

  }
  getInputToSaveSelectorCategoria(event: MatSelectChange) {
    const value = event.value;
    this.activoToSave.categoriaId = value;

  }
  getAllActivos() {

    this.api.getAllActivos().subscribe({
      next: (data: ContentActivos) => {
        this.dataSource.data = [...data.content];
        this.cdr.detectChanges();
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
    this.showProgressBusquda.update(show => !show);
    this.api.getActivosFiltered(this.filtros).subscribe({
      next: (data: ContentActivos) => {
        this.dataSource.data = data.content;
        this.showProgressBusquda.update(show => !show);
      },
      error: (err) => {
        console.error('Ocurrió un error al cargar el inventario', err);
        this.showProgressBusquda.update(show => !show);
      }
    })


  }
  getReporte() {
    this.showProgressReporte.update(show => !show);
    this.api.getReporte(this.filtros).subscribe({
      next: (data: ReporteResponse) => {
        this.downLoadReporte(data.fileBase64, data.fileName);
        this.showProgressReporte.update(show => !show);

      },
      error: (err) => {
        console.log(err);
        this.showProgressBusquda.update(show => !show);

      }
    })
  }
  downLoadReporte(base64Data: string, nombreArchivo: string) {
    const byteCharacters = atob(base64Data);

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = nombreArchivo || 'reporte_inventario.zip';

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  }
  setCurrentTab(tab: number) {
    console.log(tab);

    this.currentTab = tab;
    console.log(this.currentTab);

  }
  getCategorias() {
    this.api.getCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ocurrió un error al cargar las  categorias', err);
      }
    })
  }
  saveActivo() {
    console.log(this.activoToSave);
    if (this.activoFoundByNumSerie) {

      this.api.updateActivo(this.activoToSave).subscribe({
        next: (data: string) => {
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
          Swal.fire("Activo actualizado exitosamente", "", "success");
          this.activoFoundByNumSerie = false;
          this.clearActivoToSave();
          this.getAllActivos()

        },
        error: (err) => {
          const mensajeBackend = err.error?.message || 'Ocurrió un error inesperado al guardar el activo.';
          Swal.fire("Error al actualizar", mensajeBackend, "error");

        }
      })
    }
    else {
      this.api.saveActivo(this.activoToSave).subscribe({
        next: (data: string) => {
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
          Swal.fire("Activo guardado exitosamente", "", "success");
          this.clearActivoToSave();
          this.getAllActivos()

        },
        error: (err) => {
          const mensajeBackend = err.error?.message || 'Ocurrió un error inesperado al guardar el activo.';
          Swal.fire("Error al guardar", mensajeBackend, "error");

        }
      })
    }


  }
  activoCompleted(): boolean {
    if (this.activoToSave.numeroSerie.length > 0 &&
      this.activoToSave.marcaModelo.length > 0 &&
      this.activoToSave.costoAdquisicion > 0 &&
      this.activoToSave.categoriaId > 0
    ) {
      return true
    }
    return false
  }
  cancelInputs(): boolean {
    if (this.activoToSave.numeroSerie.length > 0 ||
      this.activoToSave.marcaModelo.length > 0 ||
      this.activoToSave.costoAdquisicion > 0 ||
      this.activoToSave.categoriaId > 0
    ) {
      return true
    }
    return false
  }
  clearActivoToSave() {
    this.activoToSave = {
      id: '',
      folioInventario: '',
      numeroSerie: '',
      marcaModelo: '',
      estado: 'DISPONIBLE',
      costoAdquisicion: 0,
      fechaIngreso: undefined,
      categoria: '',
      categoriaId: 0
    };
    this.activoFoundByNumSerie = false
  }
  getActivoByNumSerie() {
    this.api.getActivoByNumeroSerie(this.activoToSave.numeroSerie).subscribe({
      next: (data: Activo) => {
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
        if (!data) {

        } else {
          this.activoToSave = data
          this.activoFoundByNumSerie = true
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        const mensajeBackend = err.error?.message || 'Ocurrió un error inesperado al buscar el activo.';

        Swal.fire("No se encontró activo", mensajeBackend, "warning");

      }
    })
  }
  logOut() {
    this.keycloak.logout()
  }
}

