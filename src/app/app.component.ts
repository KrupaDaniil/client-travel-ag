import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { HttpService } from "../services/http.service";
import { NgOptimizedImage } from "@angular/common";
import { AuthService } from "../services/auth.service";
import { EntityStorage } from "../storage/entity.storage";
import { UserService } from "../services/user.service";
import { UserRoles } from "./enums/user-roles";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, NgOptimizedImage, RouterLink],
	providers: [HttpService, AuthService, UserService],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.css"
})
export class AppComponent {
	private readonly store = inject(EntityStorage);

	username = computed(() => this.store.username());

	constructor(private http: HttpService, private auth: AuthService, private userService: UserService) {}

	isLogin(): boolean {
		if (this.auth.isAuthenticated() && !this.auth.isTokenExpired()) {
			return true;
		} else {
			this.auth.removeToken();
			return false;
		}
	}

	onLogout(): void {
		this.userService.singOut();
	}

	checkUserRole(): boolean {
		if (this.store.roles().length === 0) {
			return false;
		}

		for (const role of this.store.roles()) {
			if (role === UserRoles.ADMIN) {
				return true;
			}

			if (role === UserRoles.MANAGER) {
				return true;
			}
		}

		return false;
	}
}
