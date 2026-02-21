import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByMonth: any[];
  productsByCategory: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard.php`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }

  getRevenueByMonth(): Observable<any> {
    return this.http.get(`${this.apiUrl}?type=revenue`);
  }

  getProductsByCategory(): Observable<any> {
    return this.http.get(`${this.apiUrl}?type=categories`);
  }
}
