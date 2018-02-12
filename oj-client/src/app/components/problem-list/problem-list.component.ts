import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';

@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})

export class ProblemListComponent implements OnInit, OnDestroy {

  problems: Problem[];
  subscriptionProblems: Subscription;

  constructor(private dataService: DataService) { }

  ngOnInit() {
	  this.getProblems();
  }

  // getProblems is observable, you have to provide unsubscription
  // e.g. You followed sth, and you unsubscribe it when you do not like it anymore
  ngOnDestroy() {
    this.subscriptionProblems.unsubscribe();
  }

  getProblems(): void{
    // this.problems=this.dataService.getProblems();
    
    // now getProblems is observable at the backend
    this.subscriptionProblems = this.dataService.getProblems()
      .subscribe(problems => this.problems = problems);
  }

}
