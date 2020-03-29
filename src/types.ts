export interface Position {
  from: number;
  to?: number;
}

export interface ParsedPosition {
  iFrom: number;
  iTo: number;
  xFrom: number | string;
  xTo: number | string;
  yFrom: number;
  yTo: number;
  isOpen: boolean;
  isWin: boolean;
}

export interface DataPoint {
  i: number;
  price: number;
  time: string;
}
