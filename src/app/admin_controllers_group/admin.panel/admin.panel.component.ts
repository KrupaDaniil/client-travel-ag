import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { EntityStorage } from "../../../storage/entity.storage";
import { UserRoles } from "../../enums/user-roles";

@Component({
	selector: "app-admin.panel",
	imports: [RouterOutlet, CommonModule, RouterModule],
	templateUrl: "./admin.panel.component.html",
	styleUrl: "./admin.panel.component.css"
})
export class AdminPanelComponent implements OnInit {
	private readonly store = inject(EntityStorage);
	protected isAdmin: boolean;
	protected isManager: boolean;

	constructor() {
		this.isAdmin = false;
		this.isManager = false;
	}

	ngOnInit(): void {
		this.setCurrentUser();
	}

	private setCurrentUser(): void {
		if (this.store.username() !== "" && this.store.roles().length > 0) {
			this.store.roles().forEach((role: string): void => {
				if (role === UserRoles.ADMIN) {
					this.isAdmin = true;
				}

				if (role === UserRoles.MANAGER) {
					this.isManager = true;
				}
			});
		}
	}
}
