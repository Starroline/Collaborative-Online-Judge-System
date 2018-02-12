import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx'; // Observable is a data stream
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

import { Problem } from '../models/problem.model';
// import { PROBLEMS } from '../mock-problems';

@Injectable()
export class DataService {
  // problems: Problem[] = PROBLEMS; //mock data won't be used anymore
  private _problemSource = new BehaviorSubject<Problem[]>([]);

  constructor(private httpClient: HttpClient) { }

  //get the problem list
  getProblems(): Observable<Problem[]> {
    // return this.problems;
    this.httpClient.get('api/v1/problems')
      .toPromise()
      .then((res: any) => {
        this._problemSource.next(res);
      })
      .catch(this.handleError);
      return this._problemSource.asObservable();
  }

  //get the problem detail
  getProblem(id: number): Promise<Problem> {
    // you can return observable or promise. promise is a special observable
    // promise includes resolve and reject; 
    // observalbe includes values, complete, error

    // return this.problems.find( (problem) => problem.id === id); //mock data

    return this.httpClient.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: any) => res)
      .catch(this.handleError);
  }

  //add a new problem
  addProblem(problem: Problem){
    // mock data
    // problem.id = this.problems.length+1;
    // this.problems.push(problem);

    const options = { headers: new HttpHeaders({ 'Content-Type': 'application/json'})};
    return this.httpClient.post('api/v1/problems', problem, options)
      .toPromise()
      .then((res: any) => {
        this.getProblems(); 
        // you have to get all problems here because when database is updated, front end do not know
        return res;
      })
      .catch(this.handleError);
  }

  buildAndRun(data): Promise<any> {
    const options = { headers: new HttpHeaders({ 'Content-Type': 'application/json'})};
    return this.httpClient.post('api/v1/submitresults', data, options)
      .toPromise()
      .then( res => {
        console.log(res); //print the results users wrote
        return res;
      })
      .catch(this.handleError);    
  }

  private handleError(error: any): Promise<any> { // any can include all different types of object
    return Promise.reject(error.body || error);
  }

}
