import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, Subject } from 'rxjs';
import { APIService } from 'src/app/services/api/api.service';
import { LocalService } from 'src/app/services/store/local.service';
import { SessionService } from 'src/app/services/store/session.service';
import { TransactModalComponent } from '../transact-modal/transact-modal.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  
  notification: any = null;
  notificationSubject: Subject<boolean> = new Subject<boolean>();

  @ViewChild('self_closing', {static: false}) selfClosing!: NgbAlert;

  stocks: any = [];
  funds: number = 0;

  constructor(private local: LocalService, private session: SessionService, private api: APIService, private modalService: NgbModal) { }

  ngAfterViewInit(): void {
    this.notificationSubject.pipe(debounceTime(5000)).subscribe((val) => {
      if(val){
        if(this.selfClosing){
          this.selfClosing.close();
        }
      }
    });
  }

  ngOnInit(): void {
    this.funds = this.local.getKey('wallet').funds;
    this.stocks = this.local.getKey('portfolio');
    if(!this.stocks){
      this.stocks = [];
    }
    this.stocks = this.stocks.map((item: any) => {
      item.total = item.transactions.reduce((previous: any, current: any) => previous + (current.price * current.qty), 0);
      item.avg = item.total / item.owned;
      item.current = null;
      item.change = null;
      item.market = null;
      item.display = null;
      this.api.getStockQuote(item.ticker).subscribe((quote) => {
        item.current = quote.c;
        item.market = item.current * item.owned;
        item.change = item.current - item.avg;
        if(item.change.toFixed(2) > 0) {
          item.display = 'text-success';
        }else if(item.change.toFixed(2) < 0){
          item.display = 'text-danger';
        }
      });
      return item;
    });
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
        this.ngOnInit();
        if(this.session.getKey('ticker') == ticker){
          this.session.setKey('owned', this.local.inPortfolio(ticker));
        }
        this.notificationSubject.next(true);
        this.notification = {
          type: buy ? 'success' : 'danger',
          text: buy ? `${ticker} bought successfully.` : `${ticker} sold successfully.`
        };
      }
    });
  }

}
