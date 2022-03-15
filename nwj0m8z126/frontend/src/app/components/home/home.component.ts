import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  title: string = "STOCK SEARCH";
  tickerSubject: Subject<string> = new Subject<string>();

  constructor() { }

  ngOnInit(): void {
  }

  forwardStockSearch($event: string){
    this.tickerSubject.next($event);
  }

}
