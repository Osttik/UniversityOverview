import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CampusLocation, CampusMap } from '../../core/models/campus-map.models';

@Component({
  selector: 'uo-campus-map',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './campus-map.component.html',
  styleUrl: './campus-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusMapComponent implements AfterViewInit {
  @ViewChild('viewport', { static: true })
  private viewportRef!: ElementRef<HTMLElement>;

  protected readonly campusMap: CampusMap = {
    universityId: 'knu',
    name: 'KNU campus map',
    imageUrl: '/assets/images/legacy/campus-map.jpg',
    width: 1200,
    height: 760,
    updatedAt: '2026-04-25T00:00:00.000Z',
    locations: [
      {
        id: 'main-hall',
        name: 'Main Hall',
        type: 'building',
        buildingCode: 'A',
        floor: '1',
        tags: ['Admissions', 'Rectorate'],
        coordinates: { x: 26, y: 38 }
      },
      {
        id: 'science-wing',
        name: 'Science Wing',
        type: 'faculty',
        buildingCode: 'C',
        floor: '2',
        tags: ['Labs', 'Lecture rooms'],
        coordinates: { x: 68, y: 58 }
      },
      {
        id: 'student-services',
        name: 'Student Services',
        type: 'service',
        buildingCode: 'B',
        floor: '1',
        tags: ['Records', 'Scholarships'],
        coordinates: { x: 48, y: 68 }
      },
      {
        id: 'metro-stop',
        name: 'Metro entrance',
        type: 'transport',
        tags: ['Transit'],
        coordinates: { x: 14, y: 76 }
      }
    ]
  };

  protected readonly mapWidth = signal(this.campusMap.width);
  protected readonly mapHeight = signal(this.campusMap.height);
  protected readonly scale = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly activeLocation = signal<CampusLocation | null>(this.campusMap.locations[0]);

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
  protected onWindowResize(): void {
    this.clampPan();
  }

  protected get locations(): CampusLocation[] {
    return this.campusMap.locations;
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
    if (event.button !== 0 || this.isInteractiveTarget(event.target)) {
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

    if (this.viewportRef.nativeElement.hasPointerCapture(event.pointerId)) {
      this.viewportRef.nativeElement.releasePointerCapture(event.pointerId);
    }
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
    const fitScale =
      Math.min(viewport.clientWidth / mapWidth, viewport.clientHeight / mapHeight) * 0.94;
    const nextScale = this.clamp(fitScale, this.minScale, this.maxScale);

    this.scale.set(nextScale);
    this.panX.set((viewport.clientWidth - mapWidth * nextScale) / 2);
    this.panY.set((viewport.clientHeight - mapHeight * nextScale) / 2);
  }

  protected selectLocation(location: CampusLocation, event?: Event): void {
    event?.stopPropagation();
    this.activeLocation.set(location);
  }

  protected clearLocation(): void {
    this.activeLocation.set(null);
  }

  protected syncMapSize(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const sizeChanged =
      this.mapWidth() !== image.naturalWidth || this.mapHeight() !== image.naturalHeight;

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

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest('button, a, input'));
  }
}
