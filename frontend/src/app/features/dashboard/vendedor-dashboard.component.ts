import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-vendedor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendedor-dashboard.component.html',
  styleUrl: './vendedor-dashboard.component.css'
})
export class VendedorDashboardComponent {
  constructor(public auth: AuthService) {}
}
