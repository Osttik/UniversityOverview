import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type UiBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  template: '{{ label }}',
  styleUrl: './ui-badge.component.css',
  host: {
    '[class]': '"ui-badge ui-badge--" + tone'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: UiBadgeTone = 'neutral';
}
