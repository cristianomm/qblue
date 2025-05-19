import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.css']
})
export class ResultsPage implements OnInit {
  results: any;
  
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private stateService: StateService
  ) {}
  
  ngOnInit(): void {
    // Try to get results from router state first
    if (typeof window !== 'undefined') {
      this.results = window.history.state;
    }
    
    // If results are invalid or missing from router state, try state service
    if (!this.results || this.results.score === undefined || this.results.score === null) {
      // Try to get results from state service
      const storedResults = this.stateService.getTestResults();
      
      if (storedResults) {
        this.results = storedResults;
      } else {
        // If no results are available anywhere, redirect to home
        this.router.navigate(['/']);
        return;
      }
    }
    
    console.log('Results loaded:', this.results);
  }

  formatTime(seconds: number): string {
    if (!seconds && seconds !== 0) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  
  getOptionText(question: any, optionKey: any): string {
    if (!question || !question.options || optionKey === undefined || optionKey === null) {
      return `Opção ${optionKey}`;
    }
    
    const foundOption = question.options.find((optObj: any) => 
      Object.keys(optObj)[0] === String(optionKey)
    );
    
    return foundOption ? Object.values(foundOption)[0] as string : `Opção ${optionKey}`;
  }

  getAnswerDisplay(question: any, answerKeyOrArray: any): string {
    if (answerKeyOrArray === undefined || answerKeyOrArray === null) {
      return "Não respondida";
    }
    
    if (Array.isArray(answerKeyOrArray)) {
      if (answerKeyOrArray.length === 0) {
        return "Não respondida";
      }
      return answerKeyOrArray.map(key => this.getOptionText(question, key)).join(', ');
    }
    
    return this.getOptionText(question, answerKeyOrArray);
  }
  
  renderOptionTextWithLink(text: unknown): any[] {
    if (text === null || text === undefined) return [];
    
    // Ensure text is a string
    const textStr = String(text);
    
    // Regular expression to find links in format {url}
    const linkRegex = /{([^{}]+)}/g;
    const segments: any[] = [];
    let lastIndex = 0;
    let match;
    
    // Find all matches of the pattern in the text
    while ((match = linkRegex.exec(textStr)) !== null) {
      // Add the text before the match if there is any
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: textStr.substring(lastIndex, match.index) });
      }
      
      // Add the link (without the curly braces)
      segments.push({ type: 'link', url: match[1] });
      
      // Update the last index to continue after this match
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last match
    if (lastIndex < textStr.length) {
      segments.push({ type: 'text', content: textStr.substring(lastIndex) });
    }
    
    // If no links were found, return the original text
    if (segments.length === 0) {
      return [{ type: 'text', content: textStr }];
    }
    
    return segments;
  }
  
  returnToHome(): void {
    // Clear all test data and results when returning to home
    this.stateService.clearAll();
    this.router.navigate(['/']);
  }
}
