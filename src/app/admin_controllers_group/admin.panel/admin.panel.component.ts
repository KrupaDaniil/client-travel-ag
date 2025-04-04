import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin.panel',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './admin.panel.component.html',
  styleUrl: './admin.panel.component.css',
})
export class AdminPanelComponent {}
