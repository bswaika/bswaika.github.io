import { Component, Input, OnInit } from '@angular/core';
import { StockChart, Chart } from 'angular-highcharts';
import * as HighCharts from 'highcharts/highstock';
import * as NormalHighCharts from 'highcharts';
import IndicatorsCore from 'highcharts/indicators/indicators';
import IndicatorVBP from 'highcharts/indicators/volume-by-price';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { Subject, tap } from 'rxjs';

NoDataToDisplay(HighCharts);
NoDataToDisplay(NormalHighCharts);
IndicatorsCore(HighCharts);
IndicatorVBP(HighCharts);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  @Input() options: any = {};
  @Input() type: any = '';
  @Input() updateSubject: Subject<any> = new Subject<any>();

  chart: StockChart | Chart;
  reflower: any = null;

  constructor() { 
    if(this.type == 'normal'){
      this.chart = new Chart(this.options);
    }else{
      this.chart = new StockChart(this.options);
    }
  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    // this.chart = new StockChart(this.options);
    // setTimeout(() => this.chart.ref$.subscribe((chart) => {
    //   chart.reflow();
    // }), 50);
    
    // this.chart.ref$.pipe(
    //   tap(val => {
    //     console.log(val);
    //     val.reflow();
    //   })
    // );
    if(this.type == 'normal'){
      this.chart = new Chart(this.options);
      this.reflower = setInterval(() => this.chart.ref.reflow(), 500);
    }else{
      this.chart = new StockChart(this.options);
      this.reflower = setInterval(() => this.chart.ref.reflow(), 500);
    }
    
    this.updateSubject.subscribe(({data, color}) => {
      // console.log(data);
      this.chart.ref.series[0].setData(data, true, true);
      this.chart.ref.series[0].options.color = color;
      // console.log(this.chart.ref.series[0]);
    });

  }

  ngOnDestroy(): void {
    clearInterval(this.reflower);
  }

}
