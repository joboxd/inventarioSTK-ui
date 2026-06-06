export interface Activo {
    id: string,
    folioInventario: string,
    numeroSerie: string,
    marcaModelo: string,
    estado: string,
    costoAdquisicion: number,
    fechaIngreso: Date,
    categoria: string
}
export interface Categoria {
    id: number,
    nombre: string,
    codigoPrefijo: string
}
export interface ContentActivos {
    content: Activo[]
}