import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { UiButtonDirective } from '../button/ui-button.directive';

@Component({
  selector: 'app-ui-empty-state',
  standalone: true,
  imports: [UiButtonDirective],
  templateUrl: './ui-empty-state.component.html',
  styleUrl: './ui-empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiEmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() actionLabel = '';
}
