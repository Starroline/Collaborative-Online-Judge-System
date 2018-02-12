import { Component, OnInit } from '@angular/core';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';

const DEFAULT_PROBLEM: Problem = Object.freeze({
  id:0,
  name:'',
  desc:'',
  difficulty:'easy'
});

@Component({
  selector: 'app-new-problem',
  templateUrl: './new-problem.component.html',
  styleUrls: ['./new-problem.component.css']
})
export class NewProblemComponent implements OnInit {

  newProblem: Problem = Object.assign({},DEFAULT_PROBLEM);
  difficulties : string[] = ['easy','medium','hard','super'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

  addProblem(){
    this.dataService.addProblem(this.newProblem)
      .then(newProblem => this.newProblem = newProblem)
      .catch(this.handleError);
    this.newProblem = Object.assign({}, DEFAULT_PROBLEM);
    //if you do not reset it as default value, all new added problems will be the same 
  }

  private handleError(error: any): Promise<any> { // any can include all different types of object
    return Promise.reject(error.body || error);
  }  
}
 