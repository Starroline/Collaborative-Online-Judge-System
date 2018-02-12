import { Routes, RouterModule } from '@angular/router';
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemDetailComponent } from './components/problem-detail/problem-detail.component';
import { NewProblemComponent } from './components/new-problem/new-problem.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { Page404Component } from './components/page404/page404.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'problems',
    pathMatch: 'full'
  },
  {
    path: 'problems',
    component: ProblemListComponent
  },
  {
    path: 'problems/:id',
    component: ProblemDetailComponent
  },
  {
    path: 'myprofile',
    component: MyProfileComponent
  },
  {
    path: '**',
    component: Page404Component
  }
];

export const routing = RouterModule.forRoot(routes);
