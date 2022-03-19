import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.css']
})
export class NewsModalComponent implements OnInit {

  @Input() news: any = {};
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  formatDateString(date: any){
    let parts = new Date(date).toLocaleDateString('en-US', {
      dateStyle: 'full'
    }).split(',');
    return parts[1] + ', ' + parts[2];
  }

}
