import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

interface Question {
  id: string;
  question: string;
  text: string;
  options: { [key: string]: string }[];
  optiontype: 'unique' | 'multiple';
  answer: string | string[];
  explanation: string;
  reference: string;
  topics: string[];
  test: string;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private http: HttpClient) {}

  fetchQuestionsByTestType(testType: string, testSize: number): Observable<Question[]> {
    // Here you would call real API: return this.http.get<Question[]>(`/api/questions/${testType}`);

    const url = `/assets/${testType}.json`;

    const questions = this.http.get<any>(url).pipe(
      map(payload => {
        // Handle nested structure where data is inside a property with the same name as testType
        const questionsData = payload[testType]?.questions || payload.questions;
        
        if (!questionsData?.length) {
          throw new Error(`Arquivo encontrado, mas sem perguntas.`);
        }

        // opcional: embaralha as questões
        const shuffled = [...questionsData];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        for(let i=0; i < shuffled.length; i++){
          let questionId = i + 1;
          shuffled[i].id = questionId;
          shuffled[i].question = "Questão " + String(questionId).padStart(3,'0');
        }

        return shuffled.slice(0, testSize);
      })
    );
    return questions;
  }
}
