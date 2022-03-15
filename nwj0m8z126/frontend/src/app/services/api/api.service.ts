import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient) { }

  getSuggestions(text: string): Observable<any>{
    //MAKE CALL TO API WITH TEXT AND THEN RETURN RESULTS
    return this.http.get<any>(`/api/suggest/${text}`);
  }

  getStockProfile(ticker: string): Observable<any>{
    return this.http.get<any>(`/api/profile/${ticker}`);
  }

  getStockQuote(ticker: string): Observable<any>{
    return this.http.get<any>(`/api/quote/${ticker}`);
  }

  getStockPeers(ticker: string): Observable<any> {
    return this.http.get<any>(`/api/peers/${ticker}`);
  }

  getStockHistory(ticker: string, reso: string, dur: string, start: Number): Observable<any>{
    return this.http.get<any>(`/api/history/${ticker}?resolution=${reso}&duration=${dur}&now=${start}`);
  }

  getStockNews(ticker: string): Observable<any>{
    return this.http.get<any>(`/api/news/${ticker}`);
  }

  getStockRecommendations(ticker: string): Observable<any>{
    return this.http.get<any>(`/api/recommendations/${ticker}`);
  }

  getStockEarnings(ticker: string): Observable<any>{
    return this.http.get<any>(`/api/earnings/${ticker}`);
  }

  getStockSentiment(ticker: string): Observable<any>{
    return this.http.get<any>(`/api/sentiment/${ticker}`);
  }

}
