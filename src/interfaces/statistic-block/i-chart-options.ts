import {ApexChart, ApexDataLabels, ApexNonAxisChartSeries, ApexPlotOptions} from 'ng-apexcharts';

export interface IChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels
}
