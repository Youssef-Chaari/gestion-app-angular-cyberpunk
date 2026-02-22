import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-overlay" *ngIf="isVisible" (click)="close()">
      <div class="popup-content" (click)="$event.stopPropagation()">
        <div class="popup-header">
          <div class="popup-icon">{{ icon }}</div>
          <button class="popup-close" (click)="close()">×</button>
        </div>
        <div class="popup-body">
          <h3 class="popup-title">{{ title }}</h3>
          <p class="popup-message">{{ message }}</p>
        </div>
        <div class="popup-footer">
          <button class="popup-btn popup-btn-primary" (click)="close()">{{ buttonText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
      animation: fadeIn 0.3s ease-out;
    }

    .popup-content {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #00d4ff;
      border-radius: 15px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
      animation: slideIn 0.3s ease-out;
      position: relative;
      overflow: hidden;
    }

    .popup-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #00d4ff, #ff0080, #00d4ff);
      animation: shimmer 2s infinite;
    }

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px 15px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    }

    .popup-icon {
      font-size: 2rem;
      color: #00d4ff;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }

    .popup-close {
      background: none;
      border: none;
      color: #ff0080;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.3s ease;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popup-close:hover {
      background: rgba(255, 0, 128, 0.1);
      transform: scale(1.1);
    }

    .popup-body {
      padding: 20px 25px;
      text-align: center;
    }

    .popup-title {
      color: #00d4ff;
      margin: 0 0 10px 0;
      font-size: 1.4rem;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }

    .popup-message {
      color: #e0e0e0;
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
    }

    .popup-footer {
      padding: 15px 25px 20px;
      text-align: center;
      border-top: 1px solid rgba(0, 212, 255, 0.2);
    }

    .popup-btn {
      background: linear-gradient(45deg, #00d4ff, #ff0080);
      border: none;
      color: white;
      padding: 12px 30px;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
    }

    .popup-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
    }

    .popup-btn:active {
      transform: translateY(0);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class PopupComponent {
  @Input() isVisible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() icon = 'ℹ️';
  @Input() buttonText = 'OK';

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}