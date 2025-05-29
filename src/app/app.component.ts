import {Component, computed, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {HttpService} from '../services/http.service';
import {MatButton} from '@angular/material/button';
import {NgOptimizedImage} from '@angular/common';
import {AuthService} from '../services/auth.service';
import {EntityStorage} from '../storage/entity.storage';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, RouterLink, MatButton],
  providers: [HttpService, AuthService, UserService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly store = inject(EntityStorage);

  username = computed(() => this.store.username());

  constructor(private http: HttpService, private auth: AuthService, private userService: UserService) {
  }

  isLogin(): boolean {
    return this.auth.isAuthenticated();
  }

  onLogout(): void {
    this.userService.singOut();
  }
}
