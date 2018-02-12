import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CollaborationService } from '../../services/collaboration.service';
import { DataService } from '../../services/data.service';

declare const ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent implements OnInit {
  sessionId: string;
  languages: string[] = ['Java', 'Python'];
  language: string = 'Java';
  
  editor: any;

  defaultContent = {
    'Java': `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
    'Python': `class Solution:
    def example():
        # Write your code here`
  }; 

  output: string = ''; 

  constructor(private collaboration: CollaborationService,
              private route: ActivatedRoute,
              private dataService: DataService) { }
  
  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor();
        this.collaboration.restoreBuffer(); //tell me what other people have already wrote
      });
  } 

  initEditor(): void {
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/eclipse");
    this.resetEditor();
    // this.setLanguage(this.language);
    this.editor.$blockScrolling = Infinity;

    //set up collaboration socket 
    this.collaboration.init(this.editor, this.sessionId); 
    //you need to know what has been changed in the editor and who changed it
    this.editor.lastAppliedChange = null;

    //register change callback, tell the server if content in editor has been changed
    this.editor.on('change', (e) => {
      console.log('editor change: ' + JSON.stringify(e));
      if (this.editor.lastAppliedChange != e) { // now it's different from the latest change
        this.collaboration.change(JSON.stringify(e));
      }
    });

    this.editor.getSession().getSelection().on('changeCursor', () => {
      const cursor = this.editor.getSession().getSelection().getCursor();
      console.log('cursor move log from client ' + JSON.stringify(cursor));
      this.collaboration.cursorMove(JSON.stringify(cursor));
    });

  }

  resetEditor(): void {
    this.editor.setValue(this.defaultContent[this.language]);
    this.editor.getSession().setMode("ace/mode/" + this.language.toLowerCase());
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  } 

  submit(): void {
    const userCodes = this.editor.getValue();
    const data = {
      userCodes: userCodes,
      lang: this.language.toLocaleLowerCase()
    };
    this.dataService.buildAndRun(data)
      .then(res => this.output = res.text);
  }
}
