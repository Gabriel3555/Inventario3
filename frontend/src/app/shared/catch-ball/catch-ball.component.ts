import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

@Component({
  selector: 'app-catch-ball',
  standalone: true,
  template: `
    @if (!caught() && !reducedMotion) {
      <div
        #ball
        class="catch-ball"
        role="button"
        aria-label="Atrapa la bola"
        tabindex="0"
        (pointerdown)="catch($event)"
        (keydown.enter)="catchKeyboard()"
      ></div>
    }
    @if (exploding()) {
      <div class="explosion" [style.left.px]="explosionX" [style.top.px]="explosionY">
        @for (p of particles; track $index) {
          <span
            class="particle"
            [style.background]="p.color"
            [style.--dx]="p.dx + 'px'"
            [style.--dy]="p.dy + 'px'"
          ></span>
        }
      </div>
    }
  `,
  styles: [`
    .catch-ball {
      position: fixed;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #22d3ee, #6366f1 60%, #a855f7);
      box-shadow: 0 0 18px rgba(99, 102, 241, 0.55);
      cursor: pointer;
      z-index: 50;
      touch-action: none;
      will-change: transform;
      transition: box-shadow 0.2s, scale 0.2s;
    }
    .catch-ball:hover,
    .catch-ball:focus-visible {
      scale: 1.15;
      box-shadow: 0 0 32px rgba(34, 211, 238, 0.9), 0 0 60px rgba(168, 85, 247, 0.6);
    }
    .explosion {
      position: fixed;
      width: 0;
      height: 0;
      z-index: 50;
      pointer-events: none;
    }
    .particle {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: burst 0.7s ease-out forwards;
    }
    @keyframes burst {
      to {
        transform: translate(var(--dx), var(--dy)) scale(0);
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .catch-ball, .particle { animation: none; display: none; }
    }
  `]
})
export class CatchBallComponent implements OnInit, OnDestroy {
  @ViewChild('ball') ballRef?: ElementRef<HTMLDivElement>;

  caught = signal(false);
  exploding = signal(false);
  particles: Particle[] = [];
  explosionX = 0;
  explosionY = 0;
  reducedMotion = false;

  private x = 100;
  private y = 100;
  private vx = 2.4;
  private vy = 2;
  private rafId = 0;
  private readonly size = 52;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) return;
    this.x = Math.random() * (window.innerWidth - this.size);
    this.y = Math.random() * (window.innerHeight - this.size);
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  private animate = (): void => {
    if (this.caught()) return;
    this.x += this.vx;
    this.y += this.vy;
    const maxX = window.innerWidth - this.size;
    const maxY = window.innerHeight - this.size;
    if (this.x <= 0 || this.x >= maxX) {
      this.vx *= -1;
      this.x = Math.max(0, Math.min(this.x, maxX));
    }
    if (this.y <= 0 || this.y >= maxY) {
      this.vy *= -1;
      this.y = Math.max(0, Math.min(this.y, maxY));
    }
    const el = this.ballRef?.nativeElement;
    if (el) {
      el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    this.rafId = requestAnimationFrame(this.animate);
  };

  catch(event: PointerEvent): void {
    this.explode(event.clientX, event.clientY);
  }

  catchKeyboard(): void {
    this.explode(this.x + this.size / 2, this.y + this.size / 2);
  }

  private explode(cx: number, cy: number): void {
    if (this.caught()) return;
    cancelAnimationFrame(this.rafId);
    this.caught.set(true);
    this.explosionX = cx;
    this.explosionY = cy;
    const colors = ['#22d3ee', '#6366f1', '#a855f7', '#f472b6', '#facc15'];
    this.particles = Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 60 + Math.random() * 70;
      return {
        x: cx,
        y: cy,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        color: colors[i % colors.length]
      };
    });
    this.exploding.set(true);
    setTimeout(() => this.exploding.set(false), 800);
  }
}
