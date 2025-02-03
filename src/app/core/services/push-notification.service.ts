import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private messaging = inject(Messaging);
  private notificationService = inject(NotificationService);

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await this.getToken();
        console.log('Token do FCM:', token);
        return token;
      }
      throw new Error('Permissão de notificação negada');
    } catch (err) {
      console.error('Erro ao solicitar permissão:', err);
      throw err;
    }
  }

  private async getToken() {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebaseConfig.vapidKey
      });
      return token;
    } catch (err) {
      console.error('Erro ao obter token:', err);
      throw err;
    }
  }

  listenToMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Mensagem recebida:', payload);
      this.notificationService.info(
        payload.notification?.title || 'Nova notificação',
        7000
      );
    });
  }
} 