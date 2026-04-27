import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

type Program = {
  name: string;
  department: string;
  credential: string;
  duration: string;
};

const PROGRAMS: Program[] = [
  {
    name: 'Computer Science',
    department: 'Engineering and Technology',
    credential: 'Bachelor',
    duration: '4 years'
  },
  {
    name: 'Business Administration',
    department: 'Economics and Management',
    credential: 'Bachelor',
    duration: '4 years'
  },
  {
    name: 'Applied Mathematics',
    department: 'Science',
    credential: 'Master',
    duration: '2 years'
  }
];

@Component({
  selector: 'app-programs-page',
  imports: [MatButtonModule, MatCardModule, MatChipsModule],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Program catalog</p>
        <h1>Available study tracks</h1>
      </div>
      <button mat-stroked-button color="primary" type="button">Add program</button>
    </header>

    <section class="program-list" aria-label="Programs">
      @for (program of programs; track program.name) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ program.name }}</mat-card-title>
            <mat-card-subtitle>{{ program.department }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-chip-set aria-label="Program details">
              <mat-chip>{{ program.credential }}</mat-chip>
              <mat-chip>{{ program.duration }}</mat-chip>
            </mat-chip-set>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #006875;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    h1 {
      margin: 0;
      color: #111827;
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.08;
    }

    .program-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }

    mat-card {
      min-height: 170px;
      border-radius: 8px;
    }

    mat-chip-set {
      margin-top: 18px;
    }

    @media (max-width: 640px) {
      .page-header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `
})
export class ProgramsPageComponent {
  protected readonly programs = PROGRAMS;
}
