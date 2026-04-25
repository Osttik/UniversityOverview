import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  signal
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

type CampusMarker = {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app/app.component.html',
  styleUrl: './app/app.component.css'
})
class AppComponent implements AfterViewInit {
  @ViewChild('viewport', { static: true })
  private viewportRef!: ElementRef<HTMLElement>;

  protected readonly mapWidth = signal(1280);
  protected readonly mapHeight = signal(960);
  protected readonly scale = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly activeMarker = signal<CampusMarker | null>(null);

  protected readonly markers: CampusMarker[] = [
    { id: 'admin', name: 'Administration', category: 'Services', x: 18, y: 33 },
    { id: 'library', name: 'Main Library', category: 'Study', x: 38, y: 48 },
    { id: 'science', name: 'Science Hall', category: 'Academic', x: 57, y: 37 },
    { id: 'sports', name: 'Sports Center', category: 'Campus life', x: 76, y: 61 },
    { id: 'dorms', name: 'Student Dorms', category: 'Housing', x: 62, y: 75 }
  ];

  private readonly minScale = 0.35;
  private readonly maxScale = 3.25;
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startPanX = 0;
  private startPanY = 0;

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.resetViewport());
  }

  @HostListener('window:resize')
  protected resetOnResize(): void {
    this.clampPan();
  }

  protected get transform(): string {
    return `translate(${this.panX()}px, ${this.panY()}px) scale(${this.scale()})`;
  }

  protected get zoomPercent(): number {
    return Math.round(this.scale() * 100);
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();

    const viewport = this.viewportRef.nativeElement;
    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const currentScale = this.scale();
    const zoomFactor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
    const nextScale = this.clamp(currentScale * zoomFactor, this.minScale, this.maxScale);
    const ratio = nextScale / currentScale;

    this.scale.set(nextScale);
    this.panX.set(cursorX - (cursorX - this.panX()) * ratio);
    this.panY.set(cursorY - (cursorY - this.panY()) * ratio);
    this.clampPan();
  }

  protected startPan(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.startPanX = this.panX();
    this.startPanY = this.panY();
    this.viewportRef.nativeElement.setPointerCapture(event.pointerId);
  }

  protected movePan(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.panX.set(this.startPanX + event.clientX - this.dragStartX);
    this.panY.set(this.startPanY + event.clientY - this.dragStartY);
    this.clampPan();
  }

  protected endPan(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.viewportRef.nativeElement.releasePointerCapture(event.pointerId);
  }

  protected zoomIn(): void {
    this.zoomFromCenter(1.2);
  }

  protected zoomOut(): void {
    this.zoomFromCenter(1 / 1.2);
  }

  protected resetViewport(): void {
    const viewport = this.viewportRef.nativeElement;
    const mapWidth = this.mapWidth();
    const mapHeight = this.mapHeight();
    const fitScale = Math.min(
      viewport.clientWidth / mapWidth,
      viewport.clientHeight / mapHeight
    ) * 0.94;
    const nextScale = this.clamp(fitScale, this.minScale, this.maxScale);

    this.scale.set(nextScale);
    this.panX.set((viewport.clientWidth - mapWidth * nextScale) / 2);
    this.panY.set((viewport.clientHeight - mapHeight * nextScale) / 2);
  }

  protected selectMarker(marker: CampusMarker, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMarker.set(marker);
  }

  protected clearMarker(): void {
    this.activeMarker.set(null);
  }

  protected syncMapSize(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const sizeChanged =
      this.mapWidth() !== image.naturalWidth ||
      this.mapHeight() !== image.naturalHeight;

    this.mapWidth.set(image.naturalWidth);
    this.mapHeight.set(image.naturalHeight);

    if (sizeChanged) {
      this.resetViewport();
    }
  }

  private zoomFromCenter(factor: number): void {
    const viewport = this.viewportRef.nativeElement;
    const centerX = viewport.clientWidth / 2;
    const centerY = viewport.clientHeight / 2;
    const currentScale = this.scale();
    const nextScale = this.clamp(currentScale * factor, this.minScale, this.maxScale);
    const ratio = nextScale / currentScale;

    this.scale.set(nextScale);
    this.panX.set(centerX - (centerX - this.panX()) * ratio);
    this.panY.set(centerY - (centerY - this.panY()) * ratio);
    this.clampPan();
  }

  private clampPan(): void {
    const viewport = this.viewportRef.nativeElement;
    const scaledWidth = this.mapWidth() * this.scale();
    const scaledHeight = this.mapHeight() * this.scale();

    this.panX.set(this.clampAxis(this.panX(), viewport.clientWidth, scaledWidth));
    this.panY.set(this.clampAxis(this.panY(), viewport.clientHeight, scaledHeight));
  }

  private clampAxis(value: number, viewportSize: number, contentSize: number): number {
    if (contentSize <= viewportSize) {
      return (viewportSize - contentSize) / 2;
    }

    return this.clamp(value, viewportSize - contentSize, 0);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});
