/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  price: number;
  category: 'starters' | 'mains' | 'breads' | 'desserts' | 'beverages' | 'specials' | string;
  image: string;
  isSpicy: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  isChefSpecial: boolean;
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'image' | 'video';
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'event' | 'deal' | 'general';
  isActive: boolean;
  date: string;
}

export interface BulkBooking {
  id: string;
  customerName: string;
  phone: string;
  eventType: 'bandola' | 'wedding' | 'reception' | 'birthday' | 'corporate' | 'other';
  guestCount: number;
  eventDate: string;
  eventTime: string;
  selectedMenuItems: string[];
  customFoodNotes: string;
  cateringType: 'restaurant' | 'catering_service';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface RegularCustomer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface DbState {
  menu: MenuItem[];
  highlights: Highlight[];
  announcements: Announcement[];
  seasonalSpecial: SeasonalSpecial;
  vibeVideos: VibeVideo[];
  bookings: BulkBooking[];
  regularCustomers: RegularCustomer[];
}

export interface SeasonalSpecial {
  title: string;
  hindiTitle: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
  endDate: string; // ISO date-time string
}

export interface VibeVideo {
  id: string;
  url: string;
  poster: string;
  alt: string;
  hindiSubtitle: string;
  hindiTitle: string;
  englishTitle: string;
  description: string;
}

