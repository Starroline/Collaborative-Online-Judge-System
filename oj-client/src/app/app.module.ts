import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { HttpModule } from '@angular/http';
// Above was used before angular 4.3. It could still be used but not suggested
import { routing } from './app.routes';

import { DataService } from './services/data.service';
import { CollaborationService } from './services/collaboration.service';

import { AppComponent } from './app.component';
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemDetailComponent } from './components/problem-detail/problem-detail.component';
import { NewProblemComponent } from './components/new-problem/new-problem.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { Page404Component } from './components/page404/page404.component';
import { EditorComponent } from './components/editor/editor.component';


@NgModule({
  declarations: [
    AppComponent,
    ProblemListComponent,
    ProblemDetailComponent,
    NewProblemComponent,
    NavbarComponent,
    MyProfileComponent,
    Page404Component,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    DataService,
    CollaborationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
