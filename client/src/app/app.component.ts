import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { UserService } from './user.service';
import { NotificationService, Notification } from './notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, CommonModule, MatSnackBarModule, MatIconModule, MatButtonModule],

  styles: [
    `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 300px;
    }

    .notification {
      background-color: #2c3e50;
      color: white;
      padding: 12px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      animation: slideIn 0.3s ease;
      font-size: 14px;
    }

    .notification-content {
      flex: 1;
      margin: 0 10px;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    .notification.fade-out {
      animation: fadeOut 0.3s ease forwards;
    }
    `
  ],

  template: `
    <!-- <mat-toolbar>
      <span>OldPhoneDeals</span>
    </mat-toolbar> -->
    <main>
      <!-- Show the component given by the router -->
      <router-outlet></router-outlet>
    </main>

    <!-- Notifications -->
    <div class="notification-container">
      <div *ngFor="let notification of activeNotifications" 
           class="notification" 
           [class.fade-out]="notification.isFading">
        <mat-icon>{{ getNotificationIcon(notification) }}</mat-icon>
        <div class="notification-content">{{ notification.content }}</div>
        <button class="close-btn" (click)="dismissNotification(notification)">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'homes';
  activeNotifications: (Notification & { isFading?: boolean })[] = [];
  private notificationSubscription?: Subscription;
  
  constructor(
    private notificationService: NotificationService, 
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notifications => {
      // Handle new notifications - only show unread ones
      const newNotifications = notifications.filter(n => !n.isRead);
      
      if (newNotifications.length > 0) {
        // Add new notifications to the active list
        newNotifications.forEach(notification => {
          if (!this.activeNotifications.find(n => n._id === notification._id)) {
            this.activeNotifications.unshift(notification);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              this.dismissNotification(notification);
            }, 5000);
          }
        });
      }
    });
  }
  
  ngOnDestroy() {
    this.notificationSubscription?.unsubscribe();
  }
  
  dismissNotification(notification: Notification & { isFading?: boolean }) {
    // Mark as fading out first for animation
    const index = this.activeNotifications.findIndex(n => n._id === notification._id);
    if (index !== -1) {
      this.activeNotifications[index].isFading = true;
      
      // Remove after animation completes
      setTimeout(() => {
        this.activeNotifications = this.activeNotifications.filter(n => n._id !== notification._id);
      }, 300);
    }
    
    // Mark as read in notification service
    let currentNotifications: Notification[] = [];
    this.notificationService.notifications$.subscribe(notifications => {
      currentNotifications = notifications;
    }).unsubscribe();
    
    const updatedNotifications = currentNotifications.map(n => {
      if (n._id === notification._id) {
        return { ...n, isRead: true };
      }
      return n;
    });
    
    this.notificationService.updateNotifications(updatedNotifications);
  }
  
  getNotificationIcon(notification: Notification): string {
    if (notification.content.includes('Added')) {
      return 'shopping_cart';
    } else if (notification.type === 'ORDER_PLACED') {
      return 'local_shipping';
    } else if (notification.type === 'ORDER_DELIVERED') {
      return 'check_circle';
    } else {
      return 'info';
    }
  }
}
