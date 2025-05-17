// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
  disabled: boolean;
}

interface PhoneListing {
  _id: string;
  title: string;
  brand: string;
  price: number;
  stock: number;
  disabled: boolean;
  seller: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  createdAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'users';
  users: User[] = [];
  listings: PhoneListing[] = [];
  reviews: any[] = [];
  reviewSearchTerm = '';
  reviewSearchFilter = 'content'; // 'content', 'user', or 'listing'
  filteredReviews: any[] = [];

  // Search and filter
  userSearchTerm = '';
  listingSearchTerm = '';
  filteredUsers: User[] = [];
  filteredListings: PhoneListing[] = [];
  
  // Loading states
  loading = false;
  adminInfo: any = null;
  
  // Edit states
  editingUser: User | null = null;
  editingListing: PhoneListing | null = null;
  userEditForm: FormGroup;
  listingEditForm: FormGroup;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    // Initialize edit forms
    this.userEditForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.listingEditForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Get admin info from localStorage
    const admin = localStorage.getItem('admin');
    if (admin) {
      this.adminInfo = JSON.parse(admin);
    } else {
      // Redirect to login if no admin info
      this.router.navigate(['/admin']);
      return;
    }
    
    // Load initial data
    this.loadUsers();
    this.loadListings();
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.http.get<any[]>('/api/admin/reviews').subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.filteredReviews = reviews;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
      }
    });
  }

    // Delete review
  deleteReview(review: any): void {
    // Ask for confirmation
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    this.http.delete(`/api/admin/reviews/${review.listing._id}/${review._id}`)
      .subscribe({
        next: () => {
          // Remove the review from both arrays
          this.reviews = this.reviews.filter(r => 
            !(r._id === review._id && r.listing._id === review.listing._id)
          );
          
          this.filteredReviews = this.filteredReviews.filter(r => 
            !(r._id === review._id && r.listing._id === review.listing._id)
          );
          
          // Show success message
          alert('Review deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          alert('Error deleting review: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  // Component method for searching reviews across all fields
  searchReviews(): void {
    if (!this.reviewSearchTerm) {
      this.filteredReviews = this.reviews;
      return;
    }
    
    const term = this.reviewSearchTerm.toLowerCase();
    
    this.filteredReviews = this.reviews.filter(review => {
      // Search in listing title
      const listingMatch = review.listing && review.listing.title && 
        review.listing.title.toLowerCase().includes(term);
      
      // Search in review content
      const commentMatch = review.comment && 
        review.comment.toLowerCase().includes(term);
      
      // Search in reviewer name
      const reviewerMatch = review.reviewer && (
        (review.reviewer.firstname && review.reviewer.firstname.toLowerCase().includes(term)) ||
        (review.reviewer.lastname && review.reviewer.lastname.toLowerCase().includes(term)) ||
        (review.reviewer.email && review.reviewer.email.toLowerCase().includes(term))
      );
      
      // Search by rating (if the search term is a number 1-5)
      const ratingMatch = !isNaN(parseInt(term)) && 
        parseInt(term) >= 1 && 
        parseInt(term) <= 5 && 
        review.rating === parseInt(term);
      
      // Return true if any field matches
      return listingMatch || commentMatch || reviewerMatch || ratingMatch;
    });
  }
  
  // Toggle review visibility
  toggleReviewVisibility(review: any): void {
    this.http.patch(`/api/admin/reviews/${review.listing._id}/${review._id}/toggle-visibility`, {})
      .subscribe({
        next: (response: any) => {
          // Update the review in both arrays
          review.hidden = response.hidden;
          
          // Show success message
          alert(`Review ${response.hidden ? 'hidden' : 'shown'} successfully`);
        },
        error: (error) => {
          console.error('Error toggling review visibility:', error);
          alert('Error updating review');
        }
      });
  }
  
  // Get the formatted name of a user
  getUserName(user: any): string {
    if (!user) return 'Unknown User';
    return `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email || 'Unknown User';
  }
  

  getStatusText(listing: any): string {
    return listing.disabled === true ? 'DISABLED' : 'ACTIVE';
  }

  getStatusClass(listing: any): string {
    return listing.disabled === true ? 'badge disabled' : 'badge active';
  }

  getSellerName(listing: any): string {
    if (!listing.seller) return 'Unknown';
    return `${listing.seller.firstname || ''} ${listing.seller.lastname || ''}`.trim() || 'Unknown';
  }

  formatPrice(price: any): string {
    if (price === undefined || price === null) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  }

  private clickStartTarget: EventTarget | null = null;

  startClick(event: MouseEvent): void {
    this.clickStartTarget = event.target;
  }

  finishClick(event: MouseEvent): void {
    // Only close if both mousedown and mouseup occurred on the overlay itself
    if (this.clickStartTarget === event.target && event.target === event.currentTarget) {
      this.cancelEdit();
    }
    this.clickStartTarget = null;
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    // Cancel any ongoing edits when switching tabs
    this.cancelEdit();
    if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'listings') {
      this.loadListings();
    } else if (tab === 'reviews') {
      this.loadReviews();
    }
  }

  logout(): void {
    localStorage.removeItem('admin');
    this.http.post('/api/admin/logout', {}).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: () => {
        // Even if logout fails, redirect to login
        this.router.navigate(['/admin']);
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.http.get<User[]>('/api/admin/users').subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  loadListings(): void {
    this.loading = true;
    this.http.get<PhoneListing[]>('/api/admin/listings').subscribe({
      next: (listings) => {
        this.listings = listings;
        this.filteredListings = listings;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading listings:', error);
        this.loading = false;
      }
    });
  }

  searchUsers(): void {
    if (!this.userSearchTerm) {
      this.filteredUsers = this.users;
      return;
    }
    
    const term = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.firstname.toLowerCase().includes(term) ||
      user.lastname.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  searchListings(): void {
    if (!this.listingSearchTerm) {
      this.filteredListings = this.listings;
      return;
    }
    
    const term = this.listingSearchTerm.toLowerCase();
    this.filteredListings = this.listings.filter(listing =>
      listing.title.toLowerCase().includes(term) ||
      listing.brand.toLowerCase().includes(term) ||
      listing.seller.email.toLowerCase().includes(term)
    );
  }

  // Edit User Functions
  startEditUser(user: User): void {
    this.editingUser = user;
    this.userEditForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    });
  }

  saveUserEdit(): void {
    if (this.userEditForm.invalid || !this.editingUser) {
      return;
    }

    const updates = this.userEditForm.value;
    this.http.patch(`/api/admin/users/${this.editingUser._id}`, updates).subscribe({
      next: () => {
        this.loadUsers();
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  toggleUserDisabled(user: any): void {
    this.http.patch(`/api/admin/users/${user._id}/toggle-disabled`, {}).subscribe({
      next: (response: any) => {
        // Update user's disabled status in local arrays
        const userIndex = this.users.findIndex(u => u._id === user._id);
        if (userIndex !== -1) {
          this.users[userIndex].disabled = response.disabled;
        }
        
        const filteredIndex = this.filteredUsers.findIndex(u => u._id === user._id);
        if (filteredIndex !== -1) {
          this.filteredUsers[filteredIndex].disabled = response.disabled;
        }
        
        // Show success message
        alert(`User ${response.disabled ? 'disabled' : 'enabled'} successfully`);
      },
      error: (error) => {
        console.error('Error toggling user disabled status:', error);
        alert('Error updating user: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
  // Edit Listing Functions
  startEditListing(listing: PhoneListing): void {
    this.editingListing = listing;
    this.listingEditForm.patchValue({
      title: listing.title,
      brand: listing.brand,
      price: listing.price,
      stock: listing.stock
    });
  }

  saveListingEdit(): void {
    if (this.listingEditForm.invalid || !this.editingListing) {
      return;
    }

    const updates = this.listingEditForm.value;
    this.http.patch(`/api/admin/listings/${this.editingListing._id}`, updates).subscribe({
      next: () => {
        this.loadListings();
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating listing:', error);
        alert('Error updating listing: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editingListing = null;
    this.userEditForm.reset();
    this.listingEditForm.reset();
  }

  // Existing functions (delete, toggle, etc.)
  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This will also delete all their listings and remove all their reviews.')) {
      this.http.delete(`/api/admin/users/${userId}`).subscribe({
        next: (response: any) => {
          // Update UI by removing the user from both arrays
          this.users = this.users.filter(user => user._id !== userId);
          this.filteredUsers = this.filteredUsers.filter(user => user._id !== userId);
          
          // Show confirmation with details of what was deleted
          alert(`User deleted successfully.\nAlso deleted: ${response.deletedListings} listings and removed reviews from ${response.modifiedListings} listings.`);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert(`Error deleting user: ${error.error?.message || 'Unknown error'}`);
        }
      });
    }
  }
  toggleUserAdmin(user: User): void {
    this.http.patch(`/api/admin/users/${user._id}/toggle-admin`, {}).subscribe({
      next: (response: any) => {
        const userIndex = this.users.findIndex(u => u._id === user._id);
        if (userIndex !== -1) {
          this.users[userIndex].isAdmin = response.isAdmin;
        }
        
        const filteredIndex = this.filteredUsers.findIndex(u => u._id === user._id);
        if (filteredIndex !== -1) {
          this.filteredUsers[filteredIndex].isAdmin = response.isAdmin;
        }
      },
      error: (error) => {
        console.error('Error toggling admin status:', error);
        alert('Error updating user');
      }
    });
  }

  toggleListingStatus(listing: PhoneListing): void {
    this.http.patch(`/api/admin/listings/${listing._id}/toggle-status`, {}).subscribe({
      next: (response: any) => {
        const listingIndex = this.listings.findIndex(l => l._id === listing._id);
        if (listingIndex !== -1) {
          this.listings[listingIndex].disabled = response.disabled;
        }
        
        const filteredIndex = this.filteredListings.findIndex(l => l._id === listing._id);
        if (filteredIndex !== -1) {
          this.filteredListings[filteredIndex].disabled = response.disabled;
        }
      },
      error: (error) => {
        console.error('Error toggling listing status:', error);
        alert('Error updating listing');
      }
    });
  }

  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.http.delete(`/api/admin/listings/${listingId}`).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Error deleting listing:', error);
          alert('Error deleting listing');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}