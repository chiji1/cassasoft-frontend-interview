// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: 'v726demo1',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: true,
  apiUrl: 'https://your-domain.com/api',
  apiRoot: 'http://localhost:5000',
  spoonocular: {
    apiRoot: 'https://api.spoonacular.com/food',
    apiKey: '3d01ebdfea1b4a4ca4dbf3aed3152c6c',
  },
  firebaseconfig:  {
    apiKey: 'AIzaSyD8F1RGSiywjq0AsJDX6yKM8uSMt6FCiiI',
    authDomain: 'cassaoft-1f6d8.firebaseapp.com',
    projectId: 'cassaoft-1f6d8',
    storageBucket: 'cassaoft-1f6d8.appspot.com',
    messagingSenderId: '659772264766',
    appId: '1:659772264766:web:a360ab541bff8896afdc6f',
    measurementId: 'G-H7TDFKG7NY'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
