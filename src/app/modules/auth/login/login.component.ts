import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  rxjsSubscription: Subscription;
  message: string;

  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  userData$: Observable<any>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private angularFireAuth: AngularFireAuth
  ) {
    this.userData$ = angularFireAuth.authState;
    this.userData$.subscribe((data) => {
      if (data) {
        this.router.navigate(['/tls', 'dashboard']);
      }
    });
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
        this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        null,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  async signUp(email: string, password: string): Promise<any> {
    try {
      const response = await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
      if (response) {
        return response;
      }
    }
    catch (ex) {
      throw ex;
    }
  }

  async login(email, password: string): Promise<any> {
    try {
      const response: any = await this.angularFireAuth.signInWithEmailAndPassword(email, password);
      console.log({ response });
      if (response?.user) {
        return response.user;
      }
    }
    catch (ex) {
      this.message = ex.message;
      throw ex;
    }
  }

  async submit(): Promise<void> {
    const { email: { value: email }, password: { value: password } } = this.f;
    const response = await this.login(email, password);
    if (response) {
      this.rxjsSubscription =
      this.angularFireAuth.idTokenResult.subscribe((res) => {
        if (res?.token) {
          localStorage.setItem('jwt-token', res.token);
        }
      });
      this.router.navigate(['/tls', 'dashboard']);
    }
  }

  ngOnDestroy() {
    this.rxjsSubscription?.unsubscribe();
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
