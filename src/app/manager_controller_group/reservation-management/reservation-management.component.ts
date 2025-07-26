import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-reservation-management',
    imports: [
        RouterLink,
        RouterOutlet
    ],
    templateUrl: './reservation-management.component.html',
    styleUrl: './reservation-management.component.css'
})
export class ReservationManagementComponent {

}
