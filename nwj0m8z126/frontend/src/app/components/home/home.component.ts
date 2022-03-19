import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, tap } from 'rxjs';
import { SearchResultComponent } from '../search-result/search-result.component';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  @ViewChild(SearchResultComponent) result!: SearchResultComponent;
  @ViewChild(SearchComponent) form!: SearchComponent;

  @Output() tickerChanged: EventEmitter<string> = new EventEmitter<string>();

  title: string = "STOCK SEARCH";
  tickerSubject: Subject<string> = new Subject<string>();
  resetSubject: Subject<boolean> = new Subject<boolean>();

  sessionData: any = null;

  constructor(private route: ActivatedRoute) { 
    
   }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe((params) => {
      setTimeout(() => {
        if(params.has('ticker')){
          let ticker = '' + params.get('ticker');
          if(ticker != 'home'){
            this.sessionData = null;
            this.form.ticker.setValue(ticker);
            this.forwardStockSearch(ticker);
          }
        }
      }, 0);
    });

    setTimeout(() => {
      if(this.sessionData){
        this.result.feedData(this.sessionData);
        this.form.ticker.setValue(this.sessionData.profile.ticker);
      }
    }, 0);
  }

  forwardStockSearch($event: string){
    this.tickerSubject.next($event);
  }

  forwardReset(){
    this.resetSubject.next(true);
  }

  onUrlChange($event: string){
    this.tickerChanged.emit($event);
  }

  receiveData(data: any){
    // console.log(data);
    this.sessionData = data;
  }


}
