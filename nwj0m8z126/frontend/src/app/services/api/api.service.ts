import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  baseURL: string = environment.base;

  constructor(private http: HttpClient) { }

  getSuggestions(text: string): Observable<any>{
    //MAKE CALL TO API WITH TEXT AND THEN RETURN RESULTS
    return this.http.get<any>(`${this.baseURL}/suggest/${text}`);
  }

  getStockProfile(ticker: string): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/profile/${ticker}`);
  }

  getStockQuote(ticker: string): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/quote/${ticker}`);
  }

  getStockPeers(ticker: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/peers/${ticker}`);
  }

  getStockHistory(ticker: string, reso: string, dur: string, start: Number): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/history/${ticker}?resolution=${reso}&duration=${dur}&now=${start}`);
  }

  getStockNews(ticker: string): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/news/${ticker}`);
  }

  getStockRecommendations(ticker: string): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/recommendations/${ticker}`);
  }

  getStockEarnings(ticker: string): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/earnings/${ticker}`);
  }

  getStockSentiment(ticker: string): Observable<any>{
    return this.http.get<any>(`${this.baseURL}/sentiment/${ticker}`);
  }

}
