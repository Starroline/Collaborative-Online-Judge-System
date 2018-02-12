import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})

export class ProblemDetailComponent implements OnInit {

  problem: Problem; 

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      // this.problem = this.dataService.getProblem(+params['id']);

      //getProblem is a promise
      this.dataService.getProblem(+params['id'])
        .then(problem => this.problem = problem)
        .catch(this.handleError);
    });
  }

  private handleError(error: any): Promise<any> { // any can include all different types of object
    return Promise.reject(error.body || error);
  }
  
}
