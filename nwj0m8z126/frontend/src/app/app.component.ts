import { Component } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { Router } from '@angular/router';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { SessionService } from './services/store/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title: string = 'Stock Search';
  activeURL: string = '';
  constructor(private router: Router, private session: SessionService){}

  onActivate(component: HomeComponent | WatchlistComponent | PortfolioComponent){
    if(component instanceof HomeComponent){
      if(this.session.getKey('ticker')){
        let data: any = {};
        data.profile = this.session.getKey('profile');
        data.quote = this.session.getKey('quote');
        data.peers = this.session.getKey('peers');
        data.watchlist = this.session.getKey('watchlist');
        data.top_news = this.session.getKey('top_news');
        data.charts = {};
        data.charts.summary = this.session.getKey('charts_summary');
        data.charts.charts = this.session.getKey('charts_charts');
        data.charts.earnings = this.session.getKey('charts_earnings');
        data.charts.recos = this.session.getKey('charts_recos');
        data.reddit = this.session.getKey('reddit');
        data.twitter = this.session.getKey('twitter');

        component.receiveData(data);
      }
      component.tickerChanged.subscribe((url) => this.activeURL = url);   
    }else{
      this.activeURL = this.router.routerState.snapshot.url;
    }
  }
}
