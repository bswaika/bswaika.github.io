import { Component, OnInit, Input } from '@angular/core';
import { StockChart } from 'angular-highcharts';
import * as HighCharts from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import IndicatorVBP from 'highcharts/indicators/volume-by-price';
import { Observable, Subject, map, switchMap, of, tap } from 'rxjs';
import { APIService } from '../../services/api/api.service';

IndicatorsCore(HighCharts);
IndicatorVBP(HighCharts);

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  @Input() ticker: Subject<string> = new Subject<string>();
  
  // results: Observable<any>;
  notification: any | null = null;

  loadingSubject: Subject<boolean> = new Subject<boolean>();
  priceRefreshTimer: any | null = null;
  results: Observable<any> = new Observable<any>();
  now: Number = Date.now();
  data: any = {
    profile: null,
    quote: null,
    peers: null,
    short_history: null,
    long_history: null,
    news: null,
    recommendations: null,
    sentiment: null,
    earnings: null,
    charts: null,
    top_news: null
  }

  constructor(private api: APIService) {
  }

  ngOnInit(): void {
    // this.ticker.subscribe((ticker) => {
    //   this.api.getStockProfile(ticker).subscribe
    // });
    // this.results.subscribe(console.log)
    this.results = this.ticker.pipe(
      tap((ticker) => {
        this.now = Date.now();
        this.loadingSubject.next(true);
        this.data = {
          profile: null,
          quote: null,
          peers: null,
          short_history: null,
          long_hitory: null,
          news: null,
          recommendations: null,
          sentiment: null,
          earnings: null,
          charts: null,
          top_news: null
        }
        if(this.priceRefreshTimer){
          clearInterval(this.priceRefreshTimer);
        }
        return ticker;
      }),
      switchMap((ticker) => this.api.getStockProfile(ticker))
    );

    this.results.subscribe((profile) => {
      if(Object.keys(profile).length > 0){
        this.api.getStockQuote(profile.ticker).subscribe((quote) => {
          this.api.getStockPeers(profile.ticker).subscribe((peers) => {
            this.api.getStockHistory(profile.ticker, '5', '6H', quote.t).subscribe((s_history) => {
              this.loadingSubject.next(false);
              this.data.peers = peers;
              this.data.profile = profile;
              this.data.quote = quote;
              this.data.short_history = s_history;
              this.data.charts = {
                summary: null,
                charts: null,
                insights: null
              }
              this.api.getStockNews(profile.ticker).subscribe((news) => {
                this.data.news = news;
                this.data.top_news = [];
                let count = 0;
                let i = 0;
                while(count < 5 && i < this.data.news.length){
                  const {summary, headline, datetime, url, image, source} = this.data.news[i];
                  if(summary && headline && datetime && url && image && source){
                    this.data.top_news.push(this.data.news[i])
                    count++;
                  } 
                  i++;              
                }
              });
              this.api.getStockRecommendations(profile.ticker).subscribe((reco) => {
                this.data.recommendations = reco;
              });
              this.api.getStockEarnings(profile.ticker).subscribe((earnings) => {
                this.data.earnings = earnings;
              });
              this.api.getStockSentiment(profile.ticker).subscribe((sentiment) => {
                this.data.sentiment = sentiment;
              });
              this.api.getStockHistory(profile.ticker, 'D', '2Y', quote.t).subscribe((l_history) => {
                this.data.long_history = l_history;
                let ohlcChart: any = [];
                let volChart: any = [];
                for(let i=0; i<this.data.long_history.t.length; i++){
                  // console.log(this.data.long_history.t[i]);
                  ohlcChart.push([this.data.long_history.t[i] * 1000, this.data.long_history.o[i], this.data.long_history.h[i], this.data.long_history.l[i], this.data.long_history.c[i]]);
                  volChart.push([this.data.long_history.t[i] * 1000, this.data.long_history.v[i]]);
                }

                this.data.charts.charts = new StockChart({
                  chart: {
                    height: 500
                  },
                  rangeSelector: {
                    selected: 2
                  },
              
                  title: {
                    text: `${profile.ticker} Historical`
                  },
              
                  subtitle: {
                    text: 'With SMA and Volume by Price technical indicators'
                  },
              
                  yAxis: [{
                    startOnTick: false,
                    endOnTick: false,
                    labels: {
                      align: 'right',
                      x: -3
                    },
                    title: {
                      text: 'OHLC'
                    },
                    height: '60%',
                    lineWidth: 2,
                    resize: {
                      enabled: true
                    }
                  }, {
                    labels: {
                      align: 'right',
                      x: -3
                    },
                    title: {
                      text: 'Volume'
                    },
                    top: '65%',
                    height: '35%',
                    offset: 0,
                    lineWidth: 2
                  }],
              
                  tooltip: {
                    split: true
                  },
              
                  series: [{
                    type: 'candlestick',
                    name: `${profile.ticker}`,
                    id: `${profile.ticker}`,
                    zIndex: 2,
                    data: ohlcChart
                  }, {
                    type: 'column',
                    name: 'Volume',
                    id: 'volume',
                    data: volChart,
                    yAxis: 1
                  }, {
                    type: 'vbp',
                    linkedTo: `${profile.ticker}`,
                    params: {
                      volumeSeriesID: 'volume'
                    },
                    dataLabels: {
                      enabled: false
                    },
                    zoneLines: {
                      enabled: false
                    }
                  }, {
                    type: 'sma',
                    linkedTo: `${profile.ticker}`,
                    zIndex: 1,
                    marker: {
                      enabled: false
                    }
                  }]
                });
              });

              if(this.data.quote.marketOpen){
                this.priceRefreshTimer = setInterval(() => {
                  this.api.getStockQuote(profile.ticker).subscribe((quote) => {
                    this.data.quote = quote;
                  });
                }, 15000);
              }

              let summaryChart: any = [];
              for(let i=0; i<this.data.short_history.t.length; i++){
                // console.log(this.data.short_history.t[i]);
                summaryChart.push([this.data.short_history.t[i] * 1000, this.data.short_history.c[i]]);
              }

              this.data.charts.summary = new StockChart({
                  title: {
                    text: ''
                  },
                  subtitle: {
                    text: `${this.data.profile.ticker} Hourly Price Variation`
                  },
                  navigator: {
                    height: 0,
                    handles:{
                      enabled: false
                    },
                    xAxis: {
                      labels: {
                        enabled: false
                      }
                    }
                  },
                  rangeSelector: {
                    enabled: false,
                  },
                  legend:{
                    enabled: false
                  },
                  yAxis: [{
                    title: {
                      text: ''
                    },
                    opposite: true
                  }],
                  series: [{
                    name: '',
                    type: 'line',
                    data: summaryChart,
                    color: this.data.quote.dp > 0 ? '#198754' : '#dc3545',
                    threshold: null
                  }]
                });
              

              console.log(this.data);
            });
            
          });
        });
        
        
        this.notification = null;
      }else{
        this.loadingSubject.next(false);
        this.notification = {
          type: 'danger',
          text: 'No records found!'
        };
        this.data = {
          profile: null,
          quote: null,
          peers: null,
          short_history: null,
          long_hitory: null,
          news: null,
          recommendations: null,
          sentiment: null,
          earnings: null,
          charts: null,
          top_news: null
        };
      }
    });
    
  }

  formatDateString(x: any){
    let dateString =  new Date(x).toLocaleString('en-US', {
      hour12: false
    }).replace(/\//g, '-').replace(', ', ' ');
    let parts = dateString.split(' ');
    let date = parts[0].split('-');
    if(date[0].length == 1){
      date[0] = `0${date[0]}`;
    }
    if(date[1].length == 1){
      date[0] = `0${date[0]}`;
    }
    let result = date[2] + '-' + date[0] + '-' + date[1] + ' ' + parts[1];
    return result; 
  }

}
