import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HttpService} from '../services/http.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [HttpService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client-travel-ag';
}
