import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiEmptyStateComponent,
  UiLoadingComponent
} from './shared/ui';

interface OverviewMetric {
  label: string;
  value: string;
  tone: 'info' | 'success' | 'warning';
}

@Component({
  selector: 'uo-root',
  standalone: true,
  imports: [
    UiBadgeComponent,
    UiButtonDirective,
    UiCardComponent,
    UiEmptyStateComponent,
    UiLoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly metrics: OverviewMetric[] = [
    { label: 'Universities indexed', value: '128', tone: 'info' },
    { label: 'Open programs', value: '612', tone: 'success' },
    { label: 'Pending reviews', value: '24', tone: 'warning' }
  ];
}
