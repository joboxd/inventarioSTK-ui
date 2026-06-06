import { inject, Injectable } from '@angular/core';
import { ApiCrudService } from "../../service/helper/ApiCrud-service";
import { Observable } from 'rxjs';
import { ContentActivos } from "../../models/Activo"
import { environment } from "../../../environments/environment"
@Injectable({
  providedIn: 'root',
})
export class Apis {
  private readonly api = inject(ApiCrudService)

  public getAllActivos(): Observable<ContentActivos> {
    return this.api.get(`${environment.apiInventario.host}/api/activos/all`) as Observable<ContentActivos>
  }
}
