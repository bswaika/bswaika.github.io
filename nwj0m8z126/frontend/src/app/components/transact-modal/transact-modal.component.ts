import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalService } from 'src/app/services/store/local.service';
import { SessionService } from 'src/app/services/store/session.service';

@Component({
  selector: 'app-transact-modal',
  templateUrl: './transact-modal.component.html',
  styleUrls: ['./transact-modal.component.css']
})
export class TransactModalComponent implements OnInit {

  @Input() ticker: string = '';
  @Input() name: string = '';
  @Input() owned: number = 0;
  @Input() price: number = 0;
  @Input() funds: number = 0;
  @Input() buy: boolean = true;

  error: string = '';
  total: number = 0;
  quantity = new FormControl(0);

  constructor(public activeModal: NgbActiveModal, private local: LocalService, private session: SessionService) { }

  ngOnInit(): void {
    this.quantity.valueChanges.subscribe((val) => {
      if(val < 0 || !Number.isInteger(val)){
        this.error = 'ERROR';
        this.total = 0;
      }else{
        this.total = this.price * val;
        if(this.total > this.funds && this.buy){
          this.error = 'Not enough money in wallet!';
        }else if(val > this.owned && !this.buy){
          this.error = 'You cannot sell the stocks you don\'t have!';
        }else{
          this.error = '';
        }
      }
    });
  }

  transact(){
    if(this.buy){
      this.buyStock();
    }else{
      this.sellStock();
    }
    this.activeModal.dismiss(true);
  }

  buyStock(){
    let stocks = this.local.getKey('portfolio');
    let wallet = this.local.getKey('wallet');
    if(!stocks){
      stocks = [];
      stocks.push({
        ticker: this.ticker,
        name: this.name,
        owned: this.quantity.value,
        transactions: [
          { qty: this.quantity.value, price: this.price}
        ]
      });
    }else{
      let exists = false;
      stocks = stocks.map((item:any) => {
        if(item.ticker == this.ticker){
          exists = true;
          item.owned += this.quantity.value;
          item.transactions.push({qty: this.quantity.value, price: this.price});
        }
        return item;
      });
      if(!exists){
        stocks.push({
          ticker: this.ticker,
          name: this.name,
          owned: this.quantity.value,
          transactions: [
            {qty: this.quantity.value, price: this.price}
          ]
        });
      }
    }
    wallet.funds -= this.total;
    this.local.setKey('portfolio', stocks);
    this.local.setKey('wallet', wallet);
  }

  sellStock(){
    let stocks = this.local.getKey('portfolio');
    let wallet = this.local.getKey('wallet');
    stocks = stocks.map((item:any) => {
      if(item.ticker == this.ticker){
        item.owned -= this.quantity.value;
        let sold = 0;
        while(sold != this.quantity.value){
          if(item.transactions[item.transactions.length - 1].qty <= (this.quantity.value - sold)){
            sold += item.transactions[item.transactions.length - 1].qty;
            item.transactions.pop();
          }else{
            item.transactions[item.transactions.length - 1].qty -= (this.quantity.value - sold);
            sold = this.quantity.value;
          }
        }
      }
      return item;
    });
    stocks = stocks.filter((item: any) => item.owned > 0);
    wallet.funds += this.total;
    this.local.setKey('portfolio', stocks);
    this.local.setKey('wallet', wallet);
  }

}
