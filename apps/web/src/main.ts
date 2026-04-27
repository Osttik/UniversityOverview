import { CommonModule } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
  selector: "uo-root",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>University Overview</span>
      <span class="toolbar-spacer"></span>
      <button mat-button type="button">
        Explore
      </button>
    </mat-toolbar>

    <main class="shell">
      <section class="intro">
        <p class="eyebrow">Node workspace bootstrap</p>
        <h1>Angular and Express are ready for the application rework.</h1>
        <p>
          The legacy WPF project remains in place while new web and API work starts in isolated npm workspaces.
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #f7f8fb;
        color: #1d2433;
      }

      .toolbar-spacer {
        flex: 1 1 auto;
      }

      .shell {
        width: min(1040px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0;
      }

      .intro {
        max-width: 680px;
      }

      .eyebrow {
        margin: 0 0 12px;
        color: #3f51b5;
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 16px;
        font-size: 3rem;
        line-height: 1.05;
      }

      p {
        font-size: 1.125rem;
        line-height: 1.6;
      }

      @media (max-width: 640px) {
        h1 {
          font-size: 2rem;
        }
      }
    `
  ]
})
class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideAnimationsAsync()]
}).catch((error: unknown) => console.error(error));
