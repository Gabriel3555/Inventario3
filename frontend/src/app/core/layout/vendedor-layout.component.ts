import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vendedor-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './vendedor-layout.component.html',
  styleUrl: './vendedor-layout.component.css'
})
export class VendedorLayoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  pageTitle = 'Vendedor';

  ngOnInit(): void {
    this.updateTitle();
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.getTitle(this.route))
    ).subscribe(title => {
      this.pageTitle = title;
    });
  }

  private updateTitle(): void {
    this.pageTitle = this.getTitle(this.route);
  }

  private getTitle(route: ActivatedRoute): string {
    if (route.firstChild) {
      return this.getTitle(route.firstChild);
    }
    return route.snapshot.data['title'] ?? 'Vendedor';
  }
}
