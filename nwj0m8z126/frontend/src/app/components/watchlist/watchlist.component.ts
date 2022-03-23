import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { APIService } from 'src/app/services/api/api.service';
import { LocalService } from 'src/app/services/store/local.service';
import { SessionService } from 'src/app/services/store/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  stocks: any = [];
  // intervals: any = [];

  @Output() onClickWatchlistStock: EventEmitter<string> = new EventEmitter<string>();

  constructor(private local: LocalService, private api: APIService, private session: SessionService, private router: Router) { }

  ngOnInit(): void {
    this.stocks = this.local.getKey('watchlist');
    if(!this.stocks){
      this.stocks = [];
    }
    this.stocks = this.stocks.map((item: any) => {
      this.api.getStockQuote(item.ticker).subscribe((q) => {
        item.c = q.c;
        item.d = q.d;
        item.dp = q.dp;
      });
      // this.intervals.push(setInterval(() => this.api.getStockQuote(item.ticker).subscribe((q) => {
      //   item.c = q.c;
      //   item.d = q.d;
      //   item.dp = q.dp;
      // }), 15000));
      return item;
    });
  }

  removeFromWatchlist(stock: any){
    this.local.toggleInWatchlist(stock.ticker, stock.name);
    if(this.session.getKey('ticker') == stock.ticker){
      this.session.setKey('watchlist', false);
    }
    this.ngOnInit();
  }

  onClick(ticker: string){
    this.session.clearAll();
    this.router.navigate(['search', ticker]);
  }

  ngOnDestroy(){
    // this.intervals.forEach((item: any) => clearInterval(item));
  }
}
