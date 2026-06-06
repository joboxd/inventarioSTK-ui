export const environment = {
 production: false,
  keycloack: {
    url: 'http://localhost:8081',
    realm: 'inventario',
    clientId: 'inventario-ui',
    logoutRedirectUri: "http://localhost:4200"
  },
  apiInventario:{
    host: "http://localhost:8080"
  }
  
};
