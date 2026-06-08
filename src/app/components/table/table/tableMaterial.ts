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
    MatTabsModule, MatIconModule, MatProgressSpinner],
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
  private filtros: Filtros = {}
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
  getInputFilterSelector(event: MatSelectChange) {
    const value = event.value;
    this.filtros.estado = value;

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
    // 1. Decodificar la cadena Base64 a texto binario
    const byteCharacters = atob(base64Data);

    // 2. Crear un arreglo de bytes del tamaño exacto
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // 3. Convertirlo a un arreglo tipado (Uint8Array)
    const byteArray = new Uint8Array(byteNumbers);

    // 4. Crear el Blob indicando que es un archivo ZIP
    const blob = new Blob([byteArray], { type: 'application/zip' });

    // 5. Crear una URL temporal en el navegador para este Blob
    const url = window.URL.createObjectURL(blob);

    // 6. Crear un elemento <a> (enlace) invisible y simular un clic
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = nombreArchivo || 'reporte_inventario.zip';

    document.body.appendChild(downloadLink);
    downloadLink.click();

    // 7. Limpiar el DOM y la memoria
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
    if(this.activoFoundByNumSerie){
       console.log(this.activoFoundByNumSerie);
      this.api.updateActivo(this.activoToSave).subscribe({
      next: (data: string) => {
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
       
        
        this.activoFoundByNumSerie = false;
        this.clearActivoToSave();
        this.getAllActivos()

      },
      error: (err) => {
        console.log(err);

      }
    })
    }
    else{
      this.api.saveActivo(this.activoToSave).subscribe({
      next: (data: string) => {
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }

        this.getAllActivos()

      },
      error: (err) => {
        console.log(err);

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
        //mensaje de exito
        //Se cargan datos del activo
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }

        this.activoToSave = data
        this.activoFoundByNumSerie = true
        this.cdr.detectChanges();


      },
      error: (err) => {
        console.log(err);

      }
    })
  }
}

