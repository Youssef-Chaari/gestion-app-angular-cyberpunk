import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="header-top">
          <h1>⚡ TABLEAU DE BORD</h1>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <p>⏳ Chargement du tableau de bord...</p>
      </div>

      <div *ngIf="dashboardError" class="error-message">
        <p>❌ {{ dashboardError }}</p>
      </div>

      <div *ngIf="!isLoading && !dashboardError" class="dashboard-content">
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
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.5s ease-in;
    }

    .loading-message, .error-message {
      text-align: center;
      padding: 3rem 2rem;
      font-size: 1.2rem;
      border-radius: 8px;
      margin: 2rem 0;
    }

    .loading-message {
      background: rgba(0, 212, 255, 0.1);
      border: 2px solid #00d4ff;
      color: #00d4ff;
    }

    .error-message {
      background: rgba(255, 0, 110, 0.1);
      border: 2px solid #ff006e;
      color: #ff006e;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      color: #00ff88;
      margin: 0;
      letter-spacing: 2px;
      text-transform: uppercase;
      animation: glow 2s ease-in-out infinite;
    }

    @media (max-width: 768px) {
      .header-top {
        flex-direction: column;
        align-items: flex-start;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }
    }

    .dashboard-content {
      animation: slideIn 0.5s ease-in;
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
      font-size: 2rem;
      font-weight: 900;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      word-break: break-word;
      max-width: 100%;
      overflow-wrap: break-word;
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

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
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
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef<HTMLCanvasElement>;

  totalProducts = 0;
  totalOrders = 0;
  totalRevenue = 0;
  revenueByMonth: any[] = [];
  productsByCategory: any[] = [];
  dashboardError = '';
  isLoading = true;

  private revenueChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Load dashboard data
    this.isLoading = true;
    this.dashboardError = '';
    console.log('Dashboard: Loading data...');
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.isLoading = false;
        console.log('Dashboard: Data loaded successfully', data);
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
        console.log('Dashboard data loaded:', { totalProducts: this.totalProducts, totalOrders: this.totalOrders, totalRevenue: this.totalRevenue, revenueByMonth: this.revenueByMonth, productsByCategory: this.productsByCategory });
        
        // Schedule chart update after template renders
        setTimeout(() => {
          this.updateCharts();
        }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Dashboard Error:', err);
        console.error('Error Code:', err?.code);
        console.error('Error Message:', err?.message);
        
        // Build user-friendly error message
        let errorMsg = 'Erreur lors du chargement des données du tableau de bord.';
        if (err?.code === 'permission-denied') {
          errorMsg += ' Vous devez être authentifié et avoir les permissions nécessaires.';
        } else if (err?.message) {
          errorMsg += ` ${err.message}`;
        }
        
        this.dashboardError = errorMsg;
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
    console.log('updateCharts called', { revenueCanvas: !!this.revenueCanvas, categoryCanvas: !!this.categoryCanvas });
    
    // Helper to parse "Dec 2025" format back to Date for proper sorting
    const parseMonthLabel = (label: string): Date => {
      try {
        return new Date(label);
      } catch {
        return new Date(0);
      }
    };

    const sortedRevenue = [...this.revenueByMonth].sort((a: any, b: any) => {
      const dateA = parseMonthLabel(a.month || '');
      const dateB = parseMonthLabel(b.month || '');
      return dateA.getTime() - dateB.getTime();
    });
    const revenueLabels = sortedRevenue.map(r => r.month);
    const revenueData = sortedRevenue.map(r => Number(r.revenue) || 0);

    if (this.revenueCanvas && this.revenueCanvas.nativeElement) {
      console.log('Creating revenue chart with data:', { labels: revenueLabels, data: revenueData });
      if (this.revenueChart) {
        this.revenueChart.data.labels = revenueLabels as any;
        this.revenueChart.data.datasets = [{ label: 'Revenu', data: revenueData, borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)' }];
        this.revenueChart.update();
      } else if (revenueLabels.length) {
        this.revenueChart = new Chart(this.revenueCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D, {
          type: 'line',
          data: { labels: revenueLabels, datasets: [{ label: 'Revenu (TND)', data: revenueData, borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)', fill: true, tension: 0.4 }] },
          options: { 
            responsive: true,
            maintainAspectRatio: true,
            plugins: { 
              legend: { display: true, labels: { color: '#00ff88' } } 
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,255,136,0.1)' },
                ticks: { color: '#00ff88' },
                title: { display: true, text: 'Revenu (TND)', color: '#00ff88' }
              },
              x: {
                grid: { color: 'rgba(0,255,136,0.1)' },
                ticks: { color: '#00ff88' }
              }
            }
          }
        });
      }
    } else {
      console.warn('Revenue canvas not found', this.revenueCanvas);
    }

    const catLabels = this.productsByCategory.map((c: any) => c.name);
    const catData = this.productsByCategory.map((c: any) => Number(c.count) || 0);

    if (this.categoryCanvas && this.categoryCanvas.nativeElement) {
      console.log('Creating category chart with data:', { labels: catLabels, data: catData });
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
    } else {
      console.warn('Category canvas not found', this.categoryCanvas);
    }
  }

  private destroyCharts(): void {
    if (this.revenueChart) { this.revenueChart.destroy(); this.revenueChart = null; }
    if (this.categoryChart) { this.categoryChart.destroy(); this.categoryChart = null; }
  }
}
