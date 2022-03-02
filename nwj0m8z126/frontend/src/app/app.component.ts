import { Component } from '@angular/core';
import { SearchComponent } from './components/search/search.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'Stock Search';

  onActivate(component: SearchComponent){
    if(component.title == ''){
      component.title = this.title;
    }
  }
}
