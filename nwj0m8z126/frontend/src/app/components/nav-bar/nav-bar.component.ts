import { Component, OnInit, Input } from '@angular/core';
import { Link } from './Link';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  @Input() title: string = '';
  links: Link[] = [
    { title: 'Search', route: '/search/home' },
    { title: 'Watchlist', route: '/watchlist' },
    { title: 'Portfolio', route: '/portfolio' }
  ];
  isMenuCollapsed: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
