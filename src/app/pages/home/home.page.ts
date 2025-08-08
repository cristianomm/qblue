import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css']
})
export class HomePage {
  availableTests = [
    { id: 'AIF-C01', name: 'AWS AI Practitioner' },
    { id: '1Z0-829', name: 'Java SE 17 Developer' }
  ];
  selectedTest = this.availableTests[0].id;
  timeLimit = 60;
  testSize = 10;
  isLoading = false;
  error = '';

  constructor(
    private questionService: QuestionService, 
    private router: Router,
    private stateService: StateService
  ) {}

  startTest(): void {
    if (!this.selectedTest) {
      this.error = 'Por favor, selecione um teste.';
      return;
    }
    this.isLoading = true;
    this.error = '';
    
    // Clear previous state data when starting a new test
    this.stateService.clearAll();
    
    this.questionService.fetchQuestionsByTestType(this.selectedTest, this.testSize).subscribe(
      questions => {
        // Store the data in StateService
        this.stateService.setTestData(questions, this.selectedTest, this.timeLimit, this.testSize);
        // Still pass via router state as a fallback
        this.router.navigate(['/test'], { 
          state: { questions, testType: this.selectedTest, timeLimit: this.timeLimit, testSize: this.testSize} 
        });
      },
      err => { this.error = err.message; this.isLoading = false; }
    );
  }
}
