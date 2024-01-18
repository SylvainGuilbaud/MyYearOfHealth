import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, shareReplay, tap } from 'rxjs';
import { LocalStorageService } from './localStorage.service';
import { Router } from '@angular/router';
import { environment } from '../../../environment/env';
import { IUserAuth } from '../interfaces/auth';
// import { environment } from 'src/environment/env';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public user = new BehaviorSubject<string>('');

  public user$: Observable<string> = this.user.asObservable();

  public isLoggedIn$: Observable<boolean>;

  public isLoggedOut$: Observable<boolean>;

  constructor(
    private httpClient: HttpClient,
    private storage: LocalStorageService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.user$.pipe(map((user) => !!user));

    this.isLoggedOut$ = this.isLoggedIn$.pipe(map((loggedIn) => !loggedIn));

    const user = this.storage.getUser();
    console.log(user);
    if (user) {
      console.log(user);
      this.user.next(user);
    }
  }

  signIn(userform: IUserAuth) {
    console.log(userform);
    let queryParams = new HttpParams();
    queryParams = queryParams.append('telecom', userform.telecom);
    return this.httpClient
      .get<string>(environment.apiUrl + 'Patient', { params: queryParams })
      .pipe(
        tap((data) => console.log(data)),
        map((data) => this.getCurrentUser(data)),
        shareReplay()
      );
  }

  getCurrentUser(userResponse: any) {
    if (userResponse.total == 0) {
      this.storage.clean();
      this.user.next('');
      this.router.navigate(['/auth']);
    } else {
      this.storage.saveUser(userResponse.id);
      this.user.next(userResponse.id);
      this.goToApp();
    }
  }

  public logout(): void {
    this.storage.clean();
    this.user.next('');
    this.router.navigate(['/auth']);
  }

  private goToApp(): void {
    this.router.navigate(['/welcome']);
  }
}
