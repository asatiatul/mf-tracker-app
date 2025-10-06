export type FundConfig = {
    name: string;
    code: string;
    category: string;
  };
  
  export type NAVEntry = {
    date: string;
    nav: number;
  };
  

  export type ChartType = 'line' | 'bar' | 'pie';