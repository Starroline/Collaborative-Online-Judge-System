// //mock-data:
// let problems = [
//     {
//       "id": 1,
//       "name": "Two Sum",
//       "desc": "Given an array of integers, find two numbers such that they add up to a specific target number. The function twoSum should return indices of the two numbers such that they add up to the target, where index1 must be less than index2. Please note that  your returned answers (both index1 and index2) are NOT zero-based.",
//       "difficulty": "easy"
//     },
//     {
//       "id": 2,
//       "name": "3Sum",
//       "desc": "Given an array S of n integers, are there elements a, b, c in S such that a + b + c = 0? Find all unique triplets in the array which gives the sum of zero.",
//       "difficulty": "medium"
//     },
//     {
//       "id": 3,
//       "name": "4Sum",
//       "desc": "Given an array S of n integers, are there elements a, b, c, and d in S such that a + b + c + d = target? Find all unique quadruplets in the array which gives the sum of target.",
//       "difficulty": "medium"
//     },
//     {
//       "id": 4,
//       "name": "Triangle Count",
//       "desc": "Given an array of integers, how many three numbers can be found in the array, so that we can build an triangle whose three edges length is the three numbers that we find?",
//       "difficulty": "hard"
//     },
//     {
//       "id": 5,
//       "name": "Sliding Window Maximum",
//       "desc": "Given an array of n integer with duplicate number, and a moving window(size k), move the window at each iteration from the start of the array, find the maximum number inside the window at each moving.",
//       "difficulty": "super"
//     }];

const ProblemModel = require('../models/problemModel');
const getProblems = function(){
    // //below is what we do when using mock data
    // console.log('In the problemService getProblems');
    // return new Promise((resolve, reject) => {
    //     resolve(problems);
    // }); 
    // //In the above promise, there is only resolve but no reject, 
    // //because the mock data is stored above, there is no way to return error

    return new Promise((resolve, reject) => {
        ProblemModel.find({}, (err, problems) => {
            if (err) {
                reject(err);
            } else {
                resolve(problems);
            }
        });
    });
}

const getProblem = function(idNumber){
    // console.log('In the problemService getProblem');
    // return new Promise((resolve, reject) => {
    //     resolve(problems.find(problem => problem.id===id));
    // });

    return new Promise((resolve, reject) => {
        ProblemModel.findOne({id: idNumber}, (err, problem) => {
            if (err) {
                reject(err);
            } else {
                resolve(problem);
            }
        });
    });
    //"id: idNumber": 'idNumber' you got from the browser match the 'id' in schema
}

const addProblem = function(newProblem){
    // console.log('In the problemService addProblem');
    // return new Promise((resolve, reject) => {
    //     if(problems.find(problem => problem.name===newProblem.name)){
    //         reject('Problem already exists!');
    //     } else {
    //         newProblem.id = problems.length + 1;
    //         problems.push(newProblem);
    //         resolve(newProblem);
    //     }
    // });

    return new Promise((resolve, reject) => {
        ProblemModel.findOne({name: newProblem.name}, (err, data) => {
            if (data) {
                reject('Problem already exists!');
            } else {
                ProblemModel.count({}, (err, count) => {
                    newProblem.id = count + 1;
                    const mongoProblem = new ProblemModel(newProblem);
                    mongoProblem.save();
                    resolve(mongoProblem);
                });
            }
        });
    });
}

module.exports = {
    // getProblems: getProblems,
    // getProblem: getProblem

    // In ex6, when key and value are the same, you can do as follow:
    // value, the one on the right, is the function
    getProblems,
    getProblem,
    addProblem 
}