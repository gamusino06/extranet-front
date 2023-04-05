// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  debug: true,
  webEnMantenimiento: false,
  api: {
    // url: 'http://extranetpreving.avansis.es:4201'
    url: 'http://localhost:8080', // Ejemplo de path con ruta.
    /*pathContactos: '/services/contacts',
    pathDocumentos: '/services/documents',
    pathExtranet: '/services/extranet',
    pathGdpr: '/services/gdpr',
    pathLogin: '/services/loginService',
    pathMessages: '/services/messages',
    pathUser: '/services/user'*/
  }
};

/*
  * For easier debugging in development mode, you can import the following file
  * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
  *
  * This import should be commented out in production mode because it will have a negative impact
  * on performance if an error is thrown.
  */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
