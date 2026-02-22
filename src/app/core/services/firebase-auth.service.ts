import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, Firestore, setDoc, doc } from 'firebase/firestore';
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
      switchMap(userCred => {
        // Check if email is verified
        if (!userCred.user.emailVerified) {
          return of({
            success: false,
            message: 'Veuillez vérifier votre email avant de vous connecter.',
            emailUnverified: true,
            email: userCred.user.email
          });
        }
        
        return from(userCred.user.getIdToken()).pipe(
          switchMap(token => this.getUserFromFirestore(email).pipe(
            map(fsUser => {
              if (fsUser) {
                return {
                  success: true,
                  token,
                  user: {
                    id: fsUser.id,
                    uid: userCred.user.uid,
                    firstName: fsUser.firstName || '',
                    lastName: fsUser.lastName || '',
                    email: fsUser.email,
                    role: fsUser.role || 'user'
                  }
                };
              }
              // Fallback if user not in Firestore
              return {
                success: true,
                token,
                user: { id: userCred.user.uid, uid: userCred.user.uid, firstName: '', lastName: '', email: userCred.user.email, role: 'user' }
              };
            })
          ))
        );
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ success: false, message: 'Login failed' });
      })
    );
  }

  register(email: string, password: string, userData?: any): Observable<any> {
    return from(createUserWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      switchMap(userCred => {
        const uid = userCred.user.uid;
        
        // Send email verification
        return from(sendEmailVerification(userCred.user)).pipe(
          switchMap(() => {
            // Create user document in Firestore
            const userDocRef = doc(db, 'users', uid);
            const userData_payload = {
              uid,
              email,
              firstName: userData?.firstName || '',
              lastName: userData?.lastName || '',
              emailVerified: false,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            return from(setDoc(userDocRef, userData_payload)).pipe(
              map(() => ({
                success: true,
                emailVerificationSent: true,
                message: 'Un email de vérification a été envoyé. Veuillez vérifier votre email avant de vous connecter.',
                user: {
                  id: uid,
                  uid,
                  email,
                  firstName: userData?.firstName || '',
                  lastName: userData?.lastName || '',
                  role: 'user'
                }
              }))
            );
          })
        );
      }),
      catchError(error => {
        console.error('Register error:', error);
        throw error;
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

  getCurrentFirebaseUser(): any {
    return firebaseAuth.currentUser;
  }

  checkEmailVerification(): Observable<boolean> {
    const user = firebaseAuth.currentUser;
    if (!user) return of(false);
    
    return from(user.reload()).pipe(
      map(() => {
        const updatedUser = firebaseAuth.currentUser;
        return updatedUser?.emailVerified || false;
      }),
      catchError(error => {
        console.error('Email verification check error:', error);
        return of(false);
      })
    );
  }
}
