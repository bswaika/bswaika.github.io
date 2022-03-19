import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  store = window.sessionStorage;

  constructor() { }

  setKey(key: string, value: any){
    this.store.setItem(key, JSON.stringify(value));
  }

  getKey(key: string){
    return this.store.getItem(key) ? JSON.parse('' + this.store.getItem(key)) : null;
  }

  clearAll(){
    this.store.clear();
  }
}
