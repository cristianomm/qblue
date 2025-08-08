import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-stats.component.html',
  styleUrls: ['./header-stats.component.css']
})
export class HeaderStatsComponent {
  @Input() totalQuestions!: number;
  @Input() answeredQuestions!: number;
  @Input() notAnsweredCount!: number;
}
