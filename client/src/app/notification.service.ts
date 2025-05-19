// notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  _id: string;
  type: 'ORDER_PLACED' | 'ORDER_DELIVERED' | 'ADMIN_ALERT';
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedItem?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // For admin - get all admin notifications
  getAdminNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/admin/notifications');
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`/api/notifications/read/${notificationId}`, {});
  }

  // Create order alert for admin (called when order is placed)
  createOrderAlert(orderData: any): Observable<any> {
    return this.http.post('/api/notifications/admin-alert', orderData);
  }

  // Update local notifications (can be called from components)
  updateNotifications(notifications: Notification[]) {
    this.notificationsSubject.next(notifications);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }
}
