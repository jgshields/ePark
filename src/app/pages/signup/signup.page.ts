import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthService} from '../../services/user/auth.service';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Person} from '../../model/Person';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public signupForm: FormGroup;
  public loading: HTMLIonLoadingElement;

  constructor(public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              private authService: AuthService,
              private router: Router,
              private formBuilder: FormBuilder) {
    this.signupForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(6), this.equalTo('password')])]
    });
  }

  ngOnInit() {
  }

  async signup(): Promise<void> {
    if (!this.signupForm.valid) {
      console.log('Form is not yet valid, current value: ', this.signupForm.value);
    } else {
      const password = this.signupForm.value.password;
      const person = new Person();
      person.email = this.signupForm.value.email;
      this.authService.signupUser(person, password).then(() => {
        this.loading.dismiss().then(() => {
          this.router.navigateByUrl('home');
        });
      }, error => {
        this.loading.dismiss().then(async () => {
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{text: 'Ok', role: 'cancel'}]
          });
          await alert.present();
        });
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
    }
  }

  equalTo(field_name): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const input = control.value;
      const isValid = (control.root.value[field_name] === input);
      if (!isValid) {
        return { 'equalTo': {isValid} };
      } else {
        return null;
      }
    };
  }

}
