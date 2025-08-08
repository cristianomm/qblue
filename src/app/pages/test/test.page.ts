import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TimerComponent } from '../../components/timer/timer.component';
import { HeaderStatsComponent } from '../../components/header-stats/header-stats.component';
import { QuestionComponent } from '../../components/question/question.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, RouterModule, TimerComponent, HeaderStatsComponent, QuestionComponent, ModalComponent],
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.css']
})
export class TestPage implements OnInit {
  questions: any[] = [];
  userAnswers: any = {};
  markedForLater: string[] = [];
  currentIndex = 0;
  timeLeft = 0;
  showFinish = false;
  showExit = false;
  showTimeUp = false;
  constructor(private router: Router, private stateService: StateService) {}

  get answeredCount(): number {
    return Object.keys(this.userAnswers).length;
  }

  get notAnsweredCount(): number {
    return this.questions.length - this.answeredCount;
  }

  setTimeLeft(time: number): void {
    this.timeLeft = time;
  }
  
  onTimeUp(): void {
    // When time runs out, show the time up modal
    this.showTimeUp = true;
    
    // Automatically finalize the test after a short delay
    setTimeout(() => {
      this.finalize();
    }, 3000); // 3 seconds delay to show the message
  }

  onAnswerSelect(answer: string): void {
    this.selectAnswer(answer);
  }

  ngOnInit(): void {
    // Try to get data from router state first
    const navigation = this.router.getCurrentNavigation();
    const state: any = navigation?.extras?.state || {};
    
    // If router state has data, use it
    if (state.questions) {
      this.questions = state.questions;
      this.timeLeft = state.timeLimit * 60;
    } 
    // Otherwise, try to get data from our state service
    else {
      const testData = this.stateService.getTestData();
      
      if (testData && testData.questions && testData.questions.length > 0) {
        // Restore data from state service
        this.questions = testData.questions;
        this.timeLeft = testData.timeLimit * 60;
      } else {
        // If no data is available, redirect to home
        this.router.navigate(['/']);
        return;
      }
    }
  }
  navigate(offset: number): void {
    const newIndex = this.currentIndex + offset;
    if (newIndex >= 0 && newIndex < this.questions.length) {
      this.currentIndex = newIndex;
    }
  }

  selectAnswer(answer: string): void {
    this.userAnswers[this.questions[this.currentIndex].id] = answer;
  }

  finalize(): void {
    // Get time limit from router state or state service
    const navigation = this.router.getCurrentNavigation();
    const routerState: any = navigation?.extras?.state || {};
    const timeLimit = routerState.timeLimit || 
                     (this.stateService.getTestData()?.timeLimit || 0);
    
    // Calculate time taken properly
    let timeTaken = 0;
    
    if (timeLimit && this.timeLeft !== undefined) {
      // Original time in seconds minus remaining time
      timeTaken = (timeLimit * 60) - this.timeLeft;
      
      // Ensure we don't have negative time
      if (timeTaken < 0) timeTaken = 0;
    }
    
    console.log('Time calculation:', {
      originalLimit: timeLimit * 60,
      timeLeft: this.timeLeft,
      timeTaken: timeTaken
    });
    
    // Calculate score
    let score = 0;
    const detailedResults = this.questions.map(question => {
      const userAnswer = this.userAnswers[question.id];
      const isAnswered = userAnswer !== undefined;
      const isCorrect = isAnswered && this.checkIfCorrect(question, userAnswer);
      
      if (isCorrect) {
        score++;
      }
      
      return {
        id: question.id,
        question: question.id, // Question identifier/number
        text: question.question, // Full question text
        options: question.options,
        answer: question.answer, // Correct answer
        userAnswer: userAnswer, // User's selected answer
        isAnswered: isAnswered,
        isCorrect: isCorrect,
        explanation: question.explanation,
        reference: question.reference
      };
    });
    
    const resultsData = {
      score: score,
      totalQuestions: this.questions.length,
      detailedResults: detailedResults,
      timeTaken: timeTaken
    };
    
    // Store results in state service
    this.stateService.setTestResults(resultsData);
    
    // Also pass via router state as fallback
    this.router.navigate(['/results'], { state: resultsData });
  }
  
  checkIfCorrect(question: any, userAnswer: any): boolean {
    if (Array.isArray(question.answer)) {
      if (!Array.isArray(userAnswer)) return false;
      
      // For multiple answer questions
      if (question.answer.length !== userAnswer.length) return false;
      
      // Check if all correct answers are selected
      return question.answer.every((ans: any) => userAnswer.includes(ans));
    } else {
      // For single answer questions
      return String(userAnswer) === String(question.answer);
    }
  }

  markLater(): void {
    const id = this.questions[this.currentIndex].id;
    if (this.markedForLater.includes(id)) {
      this.markedForLater = this.markedForLater.filter(i => i !== id);
    } else {
      this.markedForLater.push(id);
    }
  }

  confirmFinish(): void {
    this.finalize();
  }

  confirmExit(): void {
    // Clear test data on exit
    this.stateService.clearTestData();
    this.router.navigate(['/']);
  }
}
