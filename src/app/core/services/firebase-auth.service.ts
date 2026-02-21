import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { from, Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
const firebaseAuth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private getUserFromFirestore(email: string): Observable<any> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.docs.length > 0) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
        return null;
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      switchMap(userCred => from(userCred.user.getIdToken()).pipe(
        switchMap(token => this.getUserFromFirestore(email).pipe(
          map(fsUser => {
            if (fsUser) {
              return {
                success: true,
                token,
                user: {
                  id: fsUser.id,
                  username: fsUser.username || fsUser.email,
                  email: fsUser.email,
                  role: fsUser.role || 'user'
                }
              };
            }
            // Fallback if user not in Firestore
            return {
              success: true,
              token,
              user: { id: userCred.user.uid, username: email, email: userCred.user.email, role: 'user' }
            };
          })
        ))
      )),
      catchError(error => {
        console.error('Login error:', error);
        return of({ success: false, message: 'Login failed' });
      })
    );
  }

  register(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      switchMap(userCred => from(userCred.user.getIdToken()).pipe(
        switchMap(token => this.getUserFromFirestore(email).pipe(
          map(fsUser => {
            if (fsUser) {
              return {
                success: true,
                token,
                user: {
                  id: fsUser.id,
                  username: fsUser.username || fsUser.email,
                  email: fsUser.email,
                  role: fsUser.role || 'user'
                }
              };
            }
            // New user - use default role
            return {
              success: true,
              token,
              user: { id: userCred.user.uid, username: email, email: userCred.user.email, role: 'user' }
            };
          })
        ))
      )),
      catchError(error => {
        console.error('Register error:', error);
        return of({ success: false, message: 'Register failed' });
      })
    );
  }

  logout(): Observable<any> {
    return from(signOut(firebaseAuth));
  }

  getIdToken(): Observable<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return of(null);
    return from(user.getIdToken());
  }
}
