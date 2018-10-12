import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import {AuthService} from './services/user/auth.service';

const {StatusBar, SplashScreen} = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home',
      function: () => {}
    },
    {
      title: 'Usage',
      url: '/calendar',
      icon: 'calendar',
      function: () => {}
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: 'person',
      function: () => {}
    },
    {
      title: 'Admin',
      url: '/admin',
      icon: 'cog',
      function: () => {}
    },
    {
      title: 'Logout',
      url: '/login',
      icon: 'exit',
      function: this.auth.logoutUser()
}

  ];

  constructor(
    private platform: Platform,
    private auth: AuthService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    SplashScreen.hide().catch((error) => {
      console.log(error);
    });
    StatusBar.hide().catch((error) => {
      console.log(error);
    });

    this.platform.ready().then(() => {

    });
  }
}
