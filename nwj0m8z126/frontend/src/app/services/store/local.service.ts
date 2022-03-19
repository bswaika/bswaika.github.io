import { Injectable } from '@angular/core';

// SCENARIO FOR INCONSISTENT UI
// search --> add to watchlist --> go to watchlist page
// --> remove from watchlist page --> go back to search

// SOLUTION TO ABOVE SCENARIO
// to check if the ticker being removed is currently 
// held in state i.e, if the user searched and navigated away
// ideally just change the this.data.watchlist property
// however need to think about how to incorporate data passing
// into the search result component if i am holding search data
// in some storage.

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  store = window.localStorage;

  constructor() { }

  getKey(key: string){
    let item = this.store.getItem(key);
    if(!item){
      return item;
    }else{
      return JSON.parse('' + item);
    }    
  }

  inPortfolio(ticker: string){
    let p = this.getKey('portfolio');
    if(!p){
      return false;
    }else{
      let s = p.filter((item: any) => item.ticker == ticker);
      if(s.length == 0){
        return 0;
      }else{
        return s[0].owned;
      }
    }
  }

  inWatchlist(ticker: string){
    let wl = this.getKey('watchlist');
    if(!wl){
      return false;
    }else{
      return wl.filter((item: any) => item.ticker == ticker).length > 0;
    }
  }

  toggleInWatchlist(ticker: string, name: string){
    let wl = this.getKey('watchlist');
    if(!wl){
      this.setKey('watchlist', [{ticker, name}]);
    }else{
      if(this.inWatchlist(ticker)){
        wl = wl.filter((item: any) => item.ticker != ticker);
      }else{
        wl.push({ticker, name});
      }
      this.setKey('watchlist', wl);
    }
  }

  setKey(key: string, value: any){
    this.store.setItem(key, JSON.stringify(value));
  }
}
