import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"dabubble-172c7","appId":"1:1098632374519:web:2f7a316a716c775b1f4bf2","storageBucket":"dabubble-172c7.appspot.com","apiKey":"AIzaSyBcMF4K_odDgT1p9mYESQ--a5Et3BJgLzk","authDomain":"dabubble-172c7.firebaseapp.com","messagingSenderId":"1098632374519"}))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore())), provideAnimationsAsync()]
};
