import { Component, Input, OnInit } from '@angular/core';
import { AutocompleteService } from '../../services/autocomplete/autocomplete.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  
  @Input() title:string= '';

  ticker: string = '';
  results: any[] = [];

  constructor(private searchService: AutocompleteService) {  }

  ngOnInit(): void {
  }

  search($event: string): void{
    this.results = this.searchService.getSearchResults($event);
  }

}
