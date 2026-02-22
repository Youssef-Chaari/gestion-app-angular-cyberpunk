import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PopupData {
  isVisible: boolean;
  title: string;
  message: string;
  icon: string;
  buttonText: string;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupSubject = new BehaviorSubject<PopupData>({
    isVisible: false,
    title: '',
    message: '',
    icon: 'ℹ️',
    buttonText: 'OK'
  });

  popup$ = this.popupSubject.asObservable();

  showPopup(title: string, message: string, icon: string = 'ℹ️', buttonText: string = 'OK') {
    this.popupSubject.next({
      isVisible: true,
      title,
      message,
      icon,
      buttonText
    });
  }

  hidePopup() {
    this.popupSubject.next({
      ...this.popupSubject.value,
      isVisible: false
    });
  }

  showSuccess(message: string, title: string = 'Succès') {
    this.showPopup(title, message, '✅', 'OK');
  }

  showError(message: string, title: string = 'Erreur') {
    this.showPopup(title, message, '❌', 'OK');
  }

  showWarning(message: string, title: string = 'Attention') {
    this.showPopup(title, message, '⚠️', 'OK');
  }

  showInfo(message: string, title: string = 'Information') {
    this.showPopup(title, message, 'ℹ️', 'OK');
  }
}