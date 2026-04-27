import { Directive, HostBinding, Input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: 'button[uiButton], a[uiButton]',
  standalone: true
})
export class UiButtonDirective {
  @Input('uiButton') variant: UiButtonVariant = 'primary';
  @Input() size: UiButtonSize = 'md';
  @Input() loading = false;

  @HostBinding('class')
  get hostClasses(): string {
    return ['ui-button', `ui-button--${this.variant}`, `ui-button--${this.size}`, this.loading ? 'is-loading' : '']
      .filter(Boolean)
      .join(' ');
  }

  @HostBinding('attr.aria-busy')
  get ariaBusy(): 'true' | null {
    return this.loading ? 'true' : null;
  }
}
