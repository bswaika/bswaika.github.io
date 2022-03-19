import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable, Subject, map, switchMap, tap, debounceTime } from 'rxjs';
import { APIService } from '../../services/api/api.service';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsModalComponent } from '../news-modal/news-modal.component';
import { LocalService } from 'src/app/services/store/local.service';
import { SessionService } from 'src/app/services/store/session.service';
import { ActivatedRoute } from '@angular/router';
import { TransactModalComponent } from '../transact-modal/transact-modal.component';


@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  @Input() ticker: Subject<string> = new Subject<string>();
  @Input() reset: Subject<boolean> = new Subject<boolean>();
  @Output() urlChanged: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('self_closing', {static: false}) selfClosing!: NgbAlert;
  
  // results: Observable<any>;
  notification: any = null;
  notificationSubject: Subject<boolean> = new Subject<boolean>();

  loadingSubject: Subject<boolean> = new Subject<boolean>();
  priceRefreshTimer: any = null;
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

  constructor(private api: APIService, private local: LocalService, private session: SessionService, private modalService: NgbModal) {
  }

  ngAfterViewInit(): void{
    this.notificationSubject.pipe(debounceTime(5000)).subscribe((val) => {
      if(val){
        if(this.selfClosing){
          this.selfClosing.close();
        }
      }
    });

  }

  ngOnInit(): void {
    // this.ticker.subscribe((ticker) => {
    //   this.api.getStockProfile(ticker).subscribe
    // });
    // this.results.subscribe(console.log)
    this.reset.subscribe((val) => {
      if(val){
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
        this.notification = null;
        if(this.priceRefreshTimer){
          clearInterval(this.priceRefreshTimer);
        }
        window.history.pushState('', '', `/search/home`);
        this.urlChanged.emit(`/search/home`);
        this.session.clearAll();
      }
    })

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
        };
        this.notification = null;
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
              window.history.pushState('', '', `/search/${profile.ticker}`);
              this.urlChanged.emit(`/search/${profile.ticker}`);

              this.data.peers = peers;
              this.data.profile = profile;
              this.data.quote = quote;
              this.data.short_history = s_history;
              this.data.charts = {
                summary: null,
                charts: null,
                earnings: null,
                recos: null
              }
              this.data.watchlist = this.local.inWatchlist(profile.ticker);
              this.data.owned = this.local.inPortfolio(profile.ticker);
              
              this.session.setKey('ticker', this.data.profile.ticker);
              this.session.setKey('profile', this.data.profile);
              this.session.setKey('quote', this.data.quote);
              this.session.setKey('peers', this.data.peers);
              this.session.setKey('watchlist', this.data.watchlist);
              this.session.setKey('owned', this.data.owned);

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

                this.session.setKey('top_news', this.data.top_news);

              });
              this.api.getStockRecommendations(profile.ticker).subscribe((reco) => {
                this.data.recommendations = reco;
                this.data.charts.recos = {
                  chart: {
                      type: 'column'
                  },
                  title: {
                      text: 'Recommendation Trends'
                  },
                  xAxis: {
                      categories: this.data.recommendations.map((item: any) => {
                        let parts = item.period.split('-');
                        return `${parts[0]}-${parts[1]}`
                      })
                  },
                  yAxis: {
                      min: 0,
                      title: {
                          text: '#Analysis'
                      },
                      stackLabels: {
                          enabled: true,
                          style: {
                              fontWeight: 'bold',
                          }
                      }
                  },
                  legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      shadow: false
                  },
                  tooltip: {
                      headerFormat: '<b>{point.x}</b><br/>',
                      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                  },
                  plotOptions: {
                      column: {
                          stacking: 'normal',
                          dataLabels: {
                              enabled: true
                          }
                      }
                  },
                  series: [{
                      name: 'Strong Buy',
                      data: this.data.recommendations.map((item: any) => {
                        return item.strongBuy
                      }),
                      color: '#176f37'
                  }, {
                    name: 'Buy',
                    data: this.data.recommendations.map((item: any) => {
                      return item.buy
                    }),
                    color: '#1db954'
                  }, {
                    name: 'Hold',
                    data: this.data.recommendations.map((item: any) => {
                      return item.hold
                    }),
                    color: '#b98b1d'
                  }, {
                    name: 'Sell',
                    data: this.data.recommendations.map((item: any) => {
                      return item.sell
                    }),
                    color: '#f45b5b'
                  }, {
                    name: 'Strong Sell',
                    data: this.data.recommendations.map((item: any) => {
                      return item.strongSell
                    }),
                    color: '#813131'
                  }]
                }

                this.session.setKey('charts_recos', this.data.charts.recos);

              });
              this.api.getStockEarnings(profile.ticker).subscribe((earnings) => {
                this.data.earnings = earnings;
                this.data.charts.earnings = {
                    chart: {
                      type: 'spline'
                    },
                    title: {
                      text: 'Historical EPS Surprises'
                    },
                    xAxis: {
                      categories: this.data.earnings.map((item: any) => {
                        return `${item.period}<br>Surprise: ${item.surprise}`
                      }),
                      labels: {
                        format: `{value}`,
                        useHTML: true
                      }
                    },
                    yAxis: {
                      title: {
                          text: 'Quarterly EPS'
                      },
                      lineWidth: 2
                    },
                    legend: {
                      enabled: true
                    },
                    plotOptions: {
                      spline: {
                          marker: {
                              enable: false
                          }
                      }
                    },
                    series: [{
                      name: 'Actual',
                      data: this.data.earnings.map((item: any) => {
                        return item.actual
                      })
                    }, {
                        name: 'Estimate',
                        data: this.data.earnings.map((item: any) => {
                          return item.estimate
                        })
                    }]
                  };

                this.session.setKey('charts_earnings', this.data.charts.earnings);

              });
              this.api.getStockSentiment(profile.ticker).subscribe((sentiment) => {
                this.data.sentiment = sentiment;
                this.data.reddit = {
                  positive: this.data.sentiment.reddit.reduce((prev: Number, curr: any) => prev + curr.positiveMention, 0),
                  negative: this.data.sentiment.reddit.reduce((prev: Number, curr: any) => prev + curr.negativeMention, 0) 
                };
                this.data.twitter = {
                  positive: this.data.sentiment.twitter.reduce((prev: Number, curr: any) => prev + curr.positiveMention, 0),
                  negative: this.data.sentiment.twitter.reduce((prev: Number, curr: any) => prev + curr.negativeMention, 0)
                };

                this.data.reddit.total = this.data.reddit.negative + this.data.reddit.positive;
                this.data.twitter.total = this.data.twitter.negative + this.data.twitter.positive;

                this.session.setKey('reddit', this.data.reddit);
                this.session.setKey('twitter', this.data.twitter);
                
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

                this.data.charts.charts = {
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
                };

                this.session.setKey('charts_charts', this.data.charts.charts);

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

              this.data.charts.summary = {
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
                };
              
              this.session.setKey('charts_summary', this.data.charts.summary);
              

              console.log(this.data);
            });
            
          });
        }, (error) => {
          this.loadingSubject.next(false);
          window.history.pushState('', '', `/search/home`);
          this.urlChanged.emit(`/search/home`);
          this.notificationSubject.next(true);
          this.notification = {
            type: 'danger',
            text: `Error ${error.status}: ${error.statusText}!`
          }
        });        
        this.notification = null;
      }else{
        window.history.pushState('', '', `/search/home`);
        this.urlChanged.emit(`/search/home`);
        this.loadingSubject.next(false);
        this.notificationSubject.next(true);
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
    }, (error) => {
      this.loadingSubject.next(false);
      this.notificationSubject.next(true);
      this.notification = {
        type: 'danger',
        text: `${error}`
      }
    });
    
  }

  openNewsModal(news: any){
    const modalRef = this.modalService.open(NewsModalComponent);
    modalRef.componentInstance.news = news;
  }

  openTransactModal(ticker: string, name: string, owned: number, price: number, buy: boolean){
    const modalRef = this.modalService.open(TransactModalComponent);
    modalRef.componentInstance.ticker = ticker;
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.price = price;
    modalRef.componentInstance.owned = owned;
    modalRef.componentInstance.buy = buy;
    modalRef.componentInstance.funds = this.local.getKey('wallet').funds;

    modalRef.dismissed.subscribe((val) => {
      if(val){
        this.data.owned = this.local.inPortfolio(ticker);
        this.session.setKey('owned', this.data.owned);
        this.notificationSubject.next(true);
        this.notification = {
          type: buy ? 'success' : 'danger',
          text: buy ? `${ticker} bought successfully.` : `${ticker} sold successfully.`
        };
      }
    });
  }

  toggleInWatchlist(ticker: string, name: string){
    this.local.toggleInWatchlist(ticker, name);
    this.data.watchlist = this.local.inWatchlist(ticker);
    this.session.setKey('watchlist', this.data.watchlist);
    this.notificationSubject.next(true);
    this.notification = {
      type: this.data.watchlist ? 'success' : 'danger',
      text: this.data.watchlist ? `${ticker} added to Watchlist.` : `${ticker} removed from Watchlist.`
    };
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

  feedData(data: any){
    this.data = data;
    console.log(data);
    this.now = Date.now();
    window.history.pushState('', '', `/search/${data.profile.ticker}`);
    this.urlChanged.emit(`/search/${data.profile.ticker}`);
    if(this.data.quote.marketOpen){
      this.priceRefreshTimer = setInterval(() => {
        this.api.getStockQuote(this.data.profile.ticker).subscribe((quote) => {
          this.data.quote = quote;
        });
      }, 15000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.priceRefreshTimer);
  }

}
