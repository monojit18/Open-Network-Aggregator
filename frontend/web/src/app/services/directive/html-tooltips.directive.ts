import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HtmlTooltipComponent } from '../../helpers/html-tooltip/html-tooltip.component';

@Directive({
  selector: '[appHtmlTooltip]',
  standalone: true,
})
export class HtmlTooltipDirective {
  @Input('appHtmlTooltip') htmlContent: string | null = '';

  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay, private elementRef: ElementRef) {}

  @HostListener('mouseenter')
  show() {
    if (this.overlayRef) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: 8,
        },
      ]);

    this.overlayRef = this.overlay.create({ positionStrategy });

    const tooltipPortal = new ComponentPortal(HtmlTooltipComponent);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);
    tooltipRef.instance.htmlContent = this.htmlContent;
  }

  @HostListener('mouseleave')
  hide() {
    this.overlayRef?.detach();
    this.overlayRef = null;
  }
}
