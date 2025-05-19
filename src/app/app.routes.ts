import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { TestPage } from './pages/test/test.page';
import { ResultsPage } from './pages/results/results.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'test', component: TestPage },
  { path: 'results', component: ResultsPage },
  { path: '**', redirectTo: '' }
];
