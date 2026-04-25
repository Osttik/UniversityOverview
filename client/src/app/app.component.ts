import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CampusLocation, SearchState, University, UniversityFilters } from './models';
import { UniversityApiService } from './university-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  filters: UniversityFilters = {
    cities: [],
    regions: [],
    types: [],
    programLevels: [],
    maxTuition: 7000
  };

  searchState: SearchState = {
    query: '',
    city: '',
    region: '',
    type: '',
    programLevel: '',
    hasAccommodation: false,
    maxTuition: 7000
  };

  universities: University[] = [];
  selectedUniversity: University | null = null;
  selectedLocation: CampusLocation | null = null;
  loading = false;
  error = '';

  constructor(private readonly universityApi: UniversityApiService) {}

  ngOnInit(): void {
    this.universityApi.getFilters().subscribe({
      next: (filters) => {
        this.filters = filters;
        this.searchState.maxTuition = filters.maxTuition;
        this.search();
      },
      error: () => {
        this.error = 'Unable to load filters. Start the Nest API on port 3000 and try again.';
      }
    });
  }

  search(): void {
    this.loading = true;
    this.error = '';

    this.universityApi.search(this.searchState).subscribe({
      next: (universities) => {
        this.universities = universities;
        this.loading = false;

        if (universities.length === 0) {
          this.selectedUniversity = null;
          this.selectedLocation = null;
          return;
        }

        const stillSelected = universities.find(
          (university) => university.id === this.selectedUniversity?.id
        );
        this.selectUniversity(stillSelected ?? universities[0]);
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load universities. Check that the backend is running.';
      }
    });
  }

  selectUniversity(university: University): void {
    this.universityApi.getById(university.id).subscribe({
      next: (details) => {
        this.selectedUniversity = details;
        this.selectedLocation = details.locations[0] ?? null;
      },
      error: () => {
        this.error = 'Unable to load university details.';
      }
    });
  }

  selectLocation(location: CampusLocation): void {
    this.selectedLocation = location;
  }

  resetFilters(): void {
    this.searchState = {
      query: '',
      city: '',
      region: '',
      type: '',
      programLevel: '',
      hasAccommodation: false,
      maxTuition: this.filters.maxTuition
    };
    this.search();
  }

  trackByUniversity(_: number, university: University): string {
    return university.id;
  }

  trackByLocation(_: number, location: CampusLocation): string {
    return location.id;
  }
}
