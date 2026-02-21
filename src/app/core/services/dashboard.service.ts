import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, Firestore } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

export interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByMonth: any[];
  productsByCategory: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private productsCol = collection(db, 'products');
  private ordersCol = collection(db, 'orders');
  private categoriesCol = collection(db, 'categories');

  getDashboardData(): Observable<DashboardData> {
    // fetch products, orders, and categories
    return from(getDocs(this.productsCol)).pipe(
      switchMap(prodSnap => {
        const products: any[] = prodSnap.docs.map(d => {
          const data = d.data() as any;
          const { id, ...productData } = data;
          return { id: d.id, ...productData };
        });
        return from(getDocs(this.ordersCol)).pipe(
          switchMap(orderSnap => {
            const orders: any[] = orderSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            return from(getDocs(this.categoriesCol)).pipe(
              map(catSnap => {
                const categories: any[] = catSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

                const totalProducts = products.length;
                const totalOrders = orders.length;
                let totalRevenue = 0;

                // Calculate revenue by month
                const revenueByMonthMap: Record<string, number> = {};
                orders.forEach((o: any) => {
                  const amount = Number(o.total_amount || o.totalAmount || 0);
                  totalRevenue += amount;

                  // Get month from created_at (assuming ISO string or timestamp)
                  let monthKey = 'Unknown';
                  if (o.created_at) {
                    try {
                      const date = new Date(o.created_at);
                      monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    } catch (e) {
                      // fallback
                    }
                  }
                  revenueByMonthMap[monthKey] = (revenueByMonthMap[monthKey] || 0) + amount;
                });

                const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({
                  month,
                  revenue
                }));

                // Products by category with names
                const categoryMap: Record<string, string> = {};
                categories.forEach((cat: any) => {
                  categoryMap[String(cat.id)] = cat.name || `Category ${cat.id}`;
                });

                const byCategory: Record<string, number> = {};
                products.forEach((p: any) => {
                  const catId = String(p.categoryId ?? p.category_id ?? 'uncategorized');
                  const catName = categoryMap[catId] || `Category ${catId}`;
                  byCategory[catName] = (byCategory[catName] || 0) + 1;
                });

                return {
                  totalProducts,
                  totalOrders,
                  totalRevenue,
                  revenueByMonth,
                  productsByCategory: Object.entries(byCategory).map(([name, count]) => ({ name, count }))
                } as DashboardData;
              })
            );
          })
        );
      })
    );
  }

  getRevenueByMonth(): Observable<any> {
    return this.getDashboardData().pipe(map(d => d.revenueByMonth));
  }

  getProductsByCategory(): Observable<any> {
    return this.getDashboardData().pipe(map(d => d.productsByCategory));
  }
}
