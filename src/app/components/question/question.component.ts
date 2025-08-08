import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {
  @Input() questionData!: any;
  @Input() currentAnswer: any;
  @Input() isMarked = false;
  @Output() answerSelect = new EventEmitter<any>();

  onChange(value: any) {
    if (this.questionData.optiontype === 'multiple') {
      const current: string[] = Array.isArray(this.currentAnswer) ? [...this.currentAnswer] : [];
      const index = current.indexOf(value);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(value);
      }
      this.answerSelect.emit(current);
    } else {
      this.answerSelect.emit(value);
    }
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

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
