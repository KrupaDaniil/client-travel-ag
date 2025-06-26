import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
	selector: "app-user-booking",
	imports: [RouterOutlet, CommonModule, RouterModule],
	templateUrl: "./user-booking.component.html",
	styleUrl: "./user-booking.component.css"
})
export class UserBookingComponent {}
