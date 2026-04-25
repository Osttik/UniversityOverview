import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CampusLocation } from '../../core/models/campus-map.models';

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
export class CampusMapComponent {
  readonly locations: CampusLocation[] = [
    {
      id: 'main-hall',
      name: 'Main Hall',
      type: 'building',
      buildingCode: 'A',
      tags: ['Admissions', 'Rectorate'],
      coordinates: { x: 26, y: 38 }
    },
    {
      id: 'science-wing',
      name: 'Science Wing',
      type: 'faculty',
      buildingCode: 'C',
      tags: ['Labs', 'Lecture rooms'],
      coordinates: { x: 68, y: 58 }
    },
    {
      id: 'metro-stop',
      name: 'Metro entrance',
      type: 'transport',
      tags: ['Transit'],
      coordinates: { x: 14, y: 76 }
    }
  ];
}
