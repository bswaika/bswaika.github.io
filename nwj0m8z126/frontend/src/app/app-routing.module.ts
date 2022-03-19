import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';

const routes: Routes = [
  {path: '', redirectTo: 'search/home', pathMatch: 'full'},
  {path: 'search/home', component: HomeComponent},
  {path: 'search/:ticker', component: HomeComponent},
  {path: 'watchlist', component: WatchlistComponent},
  {path: 'portfolio', component: PortfolioComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
