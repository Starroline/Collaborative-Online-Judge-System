import { Injectable } from '@angular/core';
import { COLORS } from '../../assets/colors';

declare const io: any;
declare const ace: any;

@Injectable()
export class CollaborationService {
  clientsInfo: Object = {};
  clientNum: number = 0; 
  collaborationSocket: any;

  constructor() { }

  // below is a handshake between client and server
  init(editor: any, sessionId : string): void{
    this.collaborationSocket = io(window.location.origin, { query: 'sessionId=' + sessionId });
    //tell the server which chatting room/problem we are in
  
    // example:
    // this.collaborationSocket.on('message', (message) => {
    //   console.log('message received at client from server: ' + message);
    // }); 

    //client should also know what the server says as the example above
    this.collaborationSocket.on('change', (delta: string) => {
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]); //change the content in browser
    });

    this.collaborationSocket.on('cursorMove', (cursor: string) => {
      console.log('cursor move' + cursor);
      const session = editor.getSession();
      cursor = JSON.parse(cursor);
      const x = cursor['row'];
      const y = cursor['column'];
      const changeClientId = cursor['socketId'];
      console.log(x + ' ' + y + changeClientId);

      if (changeClientId in this.clientsInfo) {
        session.removeMarker(this.clientsInfo[changeClientId]['marker']);
      } else {
        this.clientsInfo[changeClientId] = {};
        const css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = `.editor_cursor_${changeClientId}
                        { 
                          position:absolute;
                          background:${COLORS[this.clientNum]};
                          z-index:100;
                          width:3px !important;
                        }`;
        document.body.appendChild(css);
        this.clientNum++;
      }
      const Range = ace.require('ace/range').Range;
      const newMarker = session.addMarker(new Range(x, y, x, y + 1), `editor_cursor_${changeClientId}`, true);
      this.clientsInfo[changeClientId]['marker'] = newMarker;
    });
  }

  cursorMove(cursor: string) {
    this.collaborationSocket.emit('cursorMove', cursor);
  }
  
  change(delta: string): void { //delta is what you changed in the editor
    this.collaborationSocket.emit('change', delta); //tell server the content that has been changed
  }

  restoreBuffer(): void {
    this.collaborationSocket.emit('restoreBuffer');
  }
}
 