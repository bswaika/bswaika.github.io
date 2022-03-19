import { Component, OnInit, Input } from '@angular/core';
import { of, tap } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  @Input() title: string = '';
  @Input() url: string = '';

  isMenuCollapsed: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
