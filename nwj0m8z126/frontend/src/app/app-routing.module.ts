import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SearchComponent } from './components/search/search.component';

const routes: Routes = [
  {path: '', redirectTo: 'search/home', pathMatch: 'full'},
  {path: 'search/home', component: SearchComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
