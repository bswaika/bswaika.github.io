import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {

  constructor() { }

  getSearchResults(text: string): any[]{
    //MAKE CALL TO API WITH TEXT AND THEN RETURN RESULTS
    return [
      {
        "description": "APPLE INC",
        "displaySymbol": "AAPL",
        "symbol": "AAPL",
        "type": "Common Stock"
      },
      {
        "description": "APPLE INC",
        "displaySymbol": "AAPL.SW",
        "symbol": "AAPL.SW",
        "type": "Common Stock"
      },
      {
        "description": "APPLE INC",
        "displaySymbol": "APC.BE",
        "symbol": "APC.BE",
        "type": "Common Stock"
      },
      {
        "description": "APPLE INC",
        "displaySymbol": "APC.DE",
        "symbol": "APC.DE",
        "type": "Common Stock"
      }
    ]
  }
}
