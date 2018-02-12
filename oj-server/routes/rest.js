const express = require('express');
const router = express.Router();
const problemService = require('../services/problemService');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const nodeRestClient = require('node-rest-client').Client;
const restClient = new nodeRestClient();

EXECUTOR_SERVER_URL = 'http://localhost:5000/submitresults';

restClient.registerMethod('submitresults', EXECUTOR_SERVER_URL, 'POST');

//get problems
router.get('/problems', (req, res) => {
    problemService.getProblems()
        .then(problems => res.json(problems)); 
});

//get a problem
router.get('/problems/:id', (req, res) => {
    const id = req.params.id;
    problemService.getProblem(+id) //parse string id to integer using +
        .then(problem => res.json(problem));
});

//post a problem
router.post('/problems', jsonParser, (req, res) => {
    problemService.addProblem(req.body)
        .then(problem => {
            res.json(problem);
        }, (error) =>{
            res.status(400).send('Problem already exists!');
        });
});

//build and run
router.post('/submitresults', jsonParser, (req, res) => {
    const userCodes = req.body.userCodes;
    const lang = req.body.lang;
    console.log('lang: ', lang, 'usercode: ', userCodes);
    // res.json({'text': 'hello from nodejs'});
    restClient.methods.submitresults(
        {
            data: {code: userCodes, lang: lang},
            headers: { 'Content-Type': 'application/json'}
        },
        (data, response) => {
            // build: xxx ; run: xxx
            const text = `Build output: ${data['build']}. Execute output: ${data['run']}`;
            //above equals to the meaning of 'build output: '+data['build']+', execute output:'+data['run']
            data['text'] = text;
            res.json(data);
        }
    );

}); //node desn't know how to deal with it, it passes the data to backend

module.exports = router;
 