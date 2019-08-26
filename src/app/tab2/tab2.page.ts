import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
 
stepsArray = [
  {'title':'Remote1','text':'Add arms1', 'imgUrl':'assests/icon/favicon.png'},
  {'title':'Remote2','text':'Add arms2', 'imgUrl':'assests/icon/favicon.png'},
  {'title':'Remote3','text':'Add arms3', 'imgUrl':'assests/icon/favicon.png'},
  {'title':'Remote4','text':'Add arms4', 'imgUrl':'assests/icon/favicon.png'}
];

constructor() {
   

}

}
