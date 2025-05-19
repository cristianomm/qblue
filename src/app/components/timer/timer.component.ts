import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit {
  @Input() timeLeft!: number;
  @Input() setTimeLeft!: (time: number) => void;
  @Output() timeUp = new EventEmitter<void>();
  private sub!: Subscription;
  isTimeUp = false;

  ngOnInit(): void {
    this.sub = interval(1000)
      .pipe(takeWhile(() => this.timeLeft > 0))
      .subscribe({
        next: () => this.setTimeLeft(this.timeLeft - 1),
        complete: () => {
          // When timer reaches zero, emit timeUp event and set flag
          this.isTimeUp = true;
          this.timeUp.emit();
        }
      });
  }
  
  ngOnDestroy(): void { 
    if (this.sub) {
      this.sub.unsubscribe(); 
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds/60).toString().padStart(2,'0');
    const s = (seconds%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }
}
