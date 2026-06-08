import { inject, Injectable } from '@angular/core';
import { ApiCrudService } from "../../service/helper/ApiCrud-service";
import { Observable } from 'rxjs';
import { Activo, Categoria, ContentActivos } from "../../models/Activo"
import { environment } from "../../../environments/environment"
import { Filtros } from '../../models/Filtros';
import { ReporteResponse } from '../../models/ReporteResponse';
@Injectable({
  providedIn: 'root',
})
export class Apis {
  private readonly api = inject(ApiCrudService)

  public getAllActivos(): Observable<ContentActivos> {
    return this.api.get(`${environment.apiInventario.host}/api/activos/all`) as Observable<ContentActivos>
  }
  public getActivosFiltered(body: Filtros): Observable<ContentActivos> {
    return this.api.get(`${environment.apiInventario.host}/api/activos/filtros`, [{ ...body }]) as Observable<ContentActivos>
  }
  public getReporte(body: Filtros): Observable<ReporteResponse> {
    return this.api.get(`${environment.apiInventario.host}/api/activos/reporte`, [{ ...body }]) as Observable<ReporteResponse>
  }
  public getCategorias(): Observable<Categoria[]> {
    return this.api.get(`${environment.apiInventario.host}/api/categorias/findAll`) as Observable<Categoria[]>
  }
  public saveActivo(body:Activo): Observable<string> {
    return this.api.post(`${environment.apiInventario.host}/api/activos/save`, body) as unknown as Observable<string>
  }
   public updateActivo(body:Activo): Observable<string> {
    return this.api.put(`${environment.apiInventario.host}/api/activos/update`, body) as unknown as Observable<string>
  }
  public getActivoByNumeroSerie(serie:string): Observable<Activo> {
    return this.api.get(`${environment.apiInventario.host}/api/activos/serie/${serie}`) as Observable<Activo>
  }
}
