import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TablePaginationExample } from "./components/table/table/tableMaterial";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TablePaginationExample],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('inventario-ui');
  
}
