import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

import { CampusMapApiService } from '../../core/api/campus-map-api.service';
import {
  CampusLocation,
  CampusLocationType,
  CampusMap,
  LocationSearchQuery
} from '../../core/models/campus-map.models';

@Component({
  selector: 'uo-campus-map',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule
  ],
  templateUrl: './campus-map.component.html',
  styleUrl: './campus-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusMapComponent implements AfterViewInit {
  @ViewChild('viewport', { static: true })
  private viewportRef!: ElementRef<HTMLElement>;

  protected readonly campusMap = signal<CampusMap | null>(null);
  protected readonly filteredLocations = signal<CampusLocation[]>([]);
  protected readonly searchText = signal('');
  protected readonly selectedType = signal<CampusLocationType | ''>('');
  protected readonly selectedFloor = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly mapWidth = signal(1200);
  protected readonly mapHeight = signal(760);
  protected readonly scale = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly activeLocation = signal<CampusLocation | null>(null);
  protected readonly locationTypes: readonly CampusLocationType[] = [
    'building',
    'auditorium',
    'faculty',
    'service',
    'entrance',
    'transport'
  ];
  protected readonly availableFloors = computed(() =>
    Array.from(
      new Set(
        (this.campusMap()?.locations ?? [])
          .map((location) => location.floor)
          .filter((floor): floor is string => Boolean(floor))
      )
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  );

  private readonly campusMapApi = inject(CampusMapApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly universityId = 'knu';
  private readonly minScale = 0.35;
  private readonly maxScale = 3.25;
  private viewInitialized = false;
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startPanX = 0;
  private startPanY = 0;

  constructor() {
    this.loadCampusMap();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    requestAnimationFrame(() => this.resetViewport());
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
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
    if (!this.viewInitialized) {
      return;
    }

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
    this.centerLocation(location);
  }

  protected clearLocation(): void {
    this.activeLocation.set(null);
  }

  protected updateSearch(value: string): void {
    this.searchText.set(value);
    this.refreshLocations();
  }

  protected updateType(value: CampusLocationType | ''): void {
    this.selectedType.set(value);
    this.refreshLocations();
  }

  protected updateFloor(value: string): void {
    this.selectedFloor.set(value);
    this.refreshLocations();
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.selectedType.set('');
    this.selectedFloor.set('');
    this.refreshLocations();
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

  private loadCampusMap(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.campusMapApi
      .getCampusMap(this.universityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campusMap) => {
          this.campusMap.set(campusMap);
          this.filteredLocations.set(campusMap.locations);
          this.activeLocation.set(campusMap.locations[0] ?? null);
          this.mapWidth.set(campusMap.width);
          this.mapHeight.set(campusMap.height);
          this.isLoading.set(false);

          requestAnimationFrame(() => this.resetViewport());
        },
        error: () => {
          this.errorMessage.set('Campus map data could not be loaded.');
          this.isLoading.set(false);
        }
      });
  }

  private refreshLocations(): void {
    const query: LocationSearchQuery = {
      search: this.searchText(),
      type: this.selectedType() || undefined,
      floor: this.selectedFloor()
    };

    this.campusMapApi
      .searchLocations(this.universityId, query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (locations) => {
          this.filteredLocations.set(locations);

          const selected = this.activeLocation();
          if (!selected || !locations.some((location) => location.id === selected.id)) {
            this.activeLocation.set(locations[0] ?? null);
          }
        },
        error: () => {
          this.errorMessage.set('Location filters could not be applied.');
        }
      });
  }

  private centerLocation(location: CampusLocation): void {
    if (!this.viewInitialized) {
      return;
    }

    const viewport = this.viewportRef.nativeElement;
    const markerX = (location.coordinates.x / 100) * this.mapWidth() * this.scale();
    const markerY = (location.coordinates.y / 100) * this.mapHeight() * this.scale();

    this.panX.set(viewport.clientWidth / 2 - markerX);
    this.panY.set(viewport.clientHeight / 2 - markerY);
    this.clampPan();
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
    if (!this.viewInitialized) {
      return;
    }

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
