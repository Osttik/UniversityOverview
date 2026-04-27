import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-overview-page',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    <section class="hero">
      <div>
        <p class="eyebrow">Academic planning workspace</p>
        <h1>Explore university programs from one routed Angular app.</h1>
        <p class="intro">
          A clean Material shell is ready for the reworked application, with space for departments,
          program summaries, admission details, and future backend data.
        </p>
        <a mat-flat-button color="primary" routerLink="/programs">View programs</a>
      </div>
    </section>

    <section class="cards" aria-label="Application areas">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Programs</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Browse degree tracks, delivery formats, and program ownership.
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Admissions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Reserve room for requirements, deadlines, and enrollment guidance.
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Campus</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Keep campus facts and student experience details in a structured view.
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: `
    .hero {
      min-height: 360px;
      display: grid;
      align-items: center;
      padding: clamp(32px, 7vw, 72px);
      border-radius: 8px;
      background:
        linear-gradient(110deg, rgba(13, 71, 161, 0.92), rgba(0, 131, 143, 0.82)),
        url('/assets/campus-pattern.svg');
      background-size: cover;
      color: white;
    }

    .hero > div {
      max-width: 720px;
    }

    .eyebrow {
      margin: 0 0 12px;
      text-transform: uppercase;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0;
      opacity: 0.82;
    }

    h1 {
      margin: 0;
      max-width: 760px;
      font-size: clamp(2.25rem, 6vw, 4.5rem);
      line-height: 1.02;
    }

    .intro {
      max-width: 680px;
      margin: 20px 0 28px;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 24px;
    }

    mat-card {
      min-height: 150px;
      border-radius: 8px;
    }

    mat-card-content {
      color: #4b5563;
      line-height: 1.55;
    }

    @media (max-width: 760px) {
      .cards {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class OverviewPageComponent {}
