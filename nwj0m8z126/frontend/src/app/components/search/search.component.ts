import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { APIService } from '../../services/api/api.service';
import { Observable, switchMap, map, debounceTime, distinctUntilChanged, Subject, of, startWith} from 'rxjs';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  
  @Input() title: string= '';

  @Output() onStockSearch: EventEmitter<string> = new EventEmitter<string>();
  @Output() onResetForm: EventEmitter<any> = new EventEmitter();
  

  ticker = new FormControl('', Validators.required);
  loadingSubject = new Subject<boolean>();

  suggestions: Observable<any>;
  results: Array<any> = [];
  errors: boolean = false;

  constructor(private api: APIService) {
    this.suggestions = this.ticker.valueChanges.pipe(
      map(ticker => {
        this.errors = false;
        return ticker.toUpperCase().trim();
      }),
      debounceTime(200),
      distinctUntilChanged(),
      map(ticker => {
        this.loadingSubject.next(true);
        return ticker;
      }), 
      switchMap(ticker => this.api.getSuggestions(ticker)),
      map(results => {
        this.loadingSubject.next(false);
        return results;
      })
    );
  }

  ngOnInit(): void { 
    this.suggestions.subscribe((suggestions) => {
      this.results = suggestions;
    })
  }

  onSubmit(){
    if(!this.ticker.errors){
      this.loadingSubject.next(false);
      this.onStockSearch.emit(this.ticker.value.toUpperCase().trim());
    }else{
      this.errors = true;
    }
  }

  onReset(){
    this.loadingSubject.next(false);
    this.errors = false;
    this.ticker.setValue('');
    this.onResetForm.emit();
  }

}
