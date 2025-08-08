import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Store for questions data
  private testData: {
    questions: any[];
    testType: string;
    timeLimit: number;
    testSize:number;
  } | null = null;

  // Store for results data
  private testResults: {
    score: number;
    totalQuestions: number;
    detailedResults: any[];
    timeTaken: number;
  } | null = null;

  constructor() {
    // Only load from storage in browser environment
    if (typeof window !== 'undefined') {
      // Try to recover data from sessionStorage on service initialization
      this.loadFromStorage();
    }
  }

  // Save test data when navigating to test page
  setTestData(questions: any[], testType: string, timeLimit: number, testSize: number): void {
    this.testData = { questions, testType, timeLimit, testSize };
    this.saveToStorage();
  }

  // Get test data
  getTestData(): { questions: any[]; testType: string; timeLimit: number, testSize: number } | null {
    return this.testData;
  }

  // Save test results when navigating to results page
  setTestResults(results: { score: number; totalQuestions: number; detailedResults: any[]; timeTaken: number }): void {
    this.testResults = results;
    this.saveToStorage();
  }

  // Get test results
  getTestResults(): { score: number; totalQuestions: number; detailedResults: any[]; timeTaken: number } | null {
    return this.testResults;
  }

  // Clear test data (e.g., when starting a new test)
  clearTestData(): void {
    this.testData = null;
    this.saveToStorage();
  }

  // Clear test results (e.g., when starting a new test)
  clearTestResults(): void {
    this.testResults = null;
    this.saveToStorage();
  }

  // Clear all state (e.g., when returning to home)
  clearAll(): void {
    this.testData = null;
    this.testResults = null;
    this.saveToStorage();
  }

  // Persist state to sessionStorage to survive page refreshes
  private saveToStorage(): void {
    // Only proceed if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.setItem('qblue_test_data', JSON.stringify(this.testData));
      window.sessionStorage.setItem('qblue_test_results', JSON.stringify(this.testResults));
    } catch (e) {
      console.error('Failed to save state to sessionStorage:', e);
    }
  }

  // Load state from sessionStorage
  private loadFromStorage(): void {
    // Only proceed if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const testDataStr = window.sessionStorage.getItem('qblue_test_data');
      const testResultsStr = window.sessionStorage.getItem('qblue_test_results');
      
      if (testDataStr) {
        this.testData = JSON.parse(testDataStr);
      }
      
      if (testResultsStr) {
        this.testResults = JSON.parse(testResultsStr);
      }
    } catch (e) {
      console.error('Failed to load state from sessionStorage:', e);
    }
  }
}
