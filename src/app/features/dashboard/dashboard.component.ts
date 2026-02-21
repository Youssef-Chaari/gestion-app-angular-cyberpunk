import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>⚡ TABLEAU DE BORD</h1>
      </div>

      <div class="kpi-section">
        <div class="kpi-card">
          <div class="kpi-icon">📦</div>
            <div class="kpi-content">
            <h3>TOTAL PRODUITS</h3>
            <p class="kpi-value">{{ totalProducts }}</p>
            </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">📋</div>
          <div class="kpi-content">
            <h3>TOTAL COMMANDES</h3>
            <p class="kpi-value">{{ totalOrders }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <h3>REVENUS TOTAUX</h3>
            <p class="kpi-value">TND{{ totalRevenue | number:'1.2-2' }}</p>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <h3>📈 REVENUS PAR MOIS</h3>
          <canvas #revenueCanvas></canvas>
        </div>

        <div class="chart-card">
          <h3>🥧 PRODUITS PAR CATÉGORIE</h3>
          <canvas #categoryCanvas></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.5s ease-in;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      color: #00ff88;
      margin: 0;
      letter-spacing: 2px;
      text-transform: uppercase;
      animation: glow 2s ease-in-out infinite;
    }

    .kpi-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      padding: 2rem;
      border-radius: 8px;
      border: 2px solid #00ff88;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.2), inset 0 0 20px rgba(0, 255, 136, 0.1);
      position: relative;
      overflow: hidden;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
      animation: circuit-flow 3s ease-in-out infinite;
    }

    .kpi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.5), inset 0 0 30px rgba(0, 255, 136, 0.2);
      border-color: #ff006e;
    }

    .kpi-icon {
      font-size: 3rem;
      animation: float 3s ease-in-out infinite;
    }

    .kpi-content h3 {
      margin: 0;
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-family: 'Orbitron', sans-serif;
    }

    .kpi-value {
      margin: 0.5rem 0 0 0;
      font-size: 2.5rem;
      font-weight: 900;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 2rem;
    }

    .chart-card {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      padding: 2rem;
      border-radius: 8px;
      border: 2px solid #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.2), inset 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .chart-card h3 {
      margin: 0 0 1.5rem 0;
      color: #00ff88;
      font-size: 1.2rem;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .placeholder {
      color: rgba(0, 255, 136, 0.5);
      text-align: center;
      padding: 2rem;
      font-style: italic;
    }

    @keyframes glow {
      0%, 100% {
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
      }
      50% {
        text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88, 0 0 50px #00ff88;
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    @keyframes circuit-flow {
      0% {
        background-position: 0% 0%;
      }
      100% {
        background-position: 100% 100%;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1024px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header h1 {
        font-size: 1.5rem;
      }

      .kpi-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef<HTMLCanvasElement>;

  totalProducts = 0;
  totalOrders = 0;
  totalRevenue = 0;
  revenueByMonth: any[] = [];
  productsByCategory: any[] = [];

  private revenueChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Charger les données du dashboard
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        const payload: any = data || {};
        // support different shapes
        this.totalProducts = payload.total_products ?? payload.totalProducts ?? 0;
        this.totalOrders = payload.total_orders ?? payload.totalOrders ?? 0;
        // revenue may be under revenue_by_month or revenueByMonth
        this.revenueByMonth = payload.revenue_by_month || payload.revenueByMonth || [];
        if (payload.total_revenue !== undefined) {
          this.totalRevenue = Number(payload.total_revenue);
        } else if (payload.totalRevenue !== undefined) {
          this.totalRevenue = Number(payload.totalRevenue);
        } else {
          this.totalRevenue = this.revenueByMonth.reduce((s: number, r: any) => s + (Number(r.revenue) || 0), 0);
        }
        this.productsByCategory = payload.products_by_category || payload.productsByCategory || [];
        this.updateCharts();
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // Attempt to build charts if data already loaded
    this.updateCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private updateCharts(): void {
    const sortedRevenue = [...this.revenueByMonth].sort((a: any, b: any) => {
      const ma = String(a.month || '');
      const mb = String(b.month || '');
      if (ma < mb) return -1;
      if (ma > mb) return 1;
      return 0;
    });
    const revenueLabels = sortedRevenue.map(r => r.month);
    const revenueData = sortedRevenue.map(r => Number(r.revenue) || 0);

    if (this.revenueCanvas && this.revenueCanvas.nativeElement) {
      if (this.revenueChart) {
        this.revenueChart.data.labels = revenueLabels as any;
        this.revenueChart.data.datasets = [{ label: 'Revenu', data: revenueData, borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)' }];
        this.revenueChart.update();
      } else if (revenueLabels.length) {
        this.revenueChart = new Chart(this.revenueCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D, {
          type: 'line',
          data: { labels: revenueLabels, datasets: [{ label: 'Revenu', data: revenueData, borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)', fill: true }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
    }

    const catLabels = this.productsByCategory.map((c: any) => c.name);
    const catData = this.productsByCategory.map((c: any) => Number(c.count) || 0);

    if (this.categoryCanvas && this.categoryCanvas.nativeElement) {
      if (this.categoryChart) {
        this.categoryChart.data.labels = catLabels as any;
        this.categoryChart.data.datasets = [{ data: catData, backgroundColor: ['#00ff88', '#ff006e', '#00ccff', '#ffaa00'] }];
        this.categoryChart.update();
      } else if (catLabels.length) {
        this.categoryChart = new Chart(this.categoryCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D, {
          type: 'pie',
          data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: ['#00ff88', '#ff006e', '#00ccff', '#ffaa00'] }] },
          options: { responsive: true }
        });
      }
    }
  }

  private destroyCharts(): void {
    if (this.revenueChart) { this.revenueChart.destroy(); this.revenueChart = null; }
    if (this.categoryChart) { this.categoryChart.destroy(); this.categoryChart = null; }
  }
}
