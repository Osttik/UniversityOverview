import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-loading',
  standalone: true,
  templateUrl: './ui-loading.component.html',
  styleUrl: './ui-loading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiLoadingComponent {
  @Input() label = 'Loading';
}
