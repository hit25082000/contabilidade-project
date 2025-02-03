import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PushNotificationService } from './core/services/push-notification.service';
import { NotificationsComponent } from './features/shared/UI/notification.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NotificationsComponent],
    template: `
      <app-notifications></app-notifications>
      <router-outlet></router-outlet>
    `
})
export class AppComponent implements OnInit {
  private pushNotificationService = inject(PushNotificationService);

  async ngOnInit() {
    try {
      await this.pushNotificationService.requestPermission();
      this.pushNotificationService.listenToMessages();
    } catch (error) {
      console.error('Erro ao configurar notificações push:', error);
    }
  }
}
