import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          apiKey: "AIzaSyAtt46O_zsuyolqF74hLwSwdMiIdr4NBJU",
          authDomain: "mydabubble-c6be2.firebaseapp.com",
          projectId: "mydabubble-c6be2",
          storageBucket: "mydabubble-c6be2.appspot.com",
          messagingSenderId: "870077240971",
          appId: "1:870077240971:web:dadfe993c51ea61535668e",
          databaseURL: 'https://mydabubble-c6be2-default-rtdb.europe-west1.firebasedatabase.app'
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    provideAnimationsAsync(),
  ],
};