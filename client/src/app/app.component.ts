import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <span class="brand">University Overview</span>
      <nav aria-label="Primary navigation">
        <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
          Overview
        </a>
        <a mat-button routerLink="/programs" routerLinkActive="active-link">
          Programs
        </a>
      </nav>
    </mat-toolbar>

    <main class="shell">
      <router-outlet />
    </main>
  `,
  styles: `
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding-inline: clamp(16px, 4vw, 48px);
    }

    .brand {
      font-weight: 600;
    }

    nav {
      display: flex;
      gap: 8px;
    }

    a.active-link {
      background: rgba(255, 255, 255, 0.18);
    }

    .shell {
      width: min(1120px, calc(100% - 32px));
      margin: 32px auto;
    }

    @media (max-width: 640px) {
      .app-toolbar {
        height: auto;
        align-items: flex-start;
        flex-direction: column;
        padding-block: 12px;
      }
    }
  `
})
export class AppComponent {}
