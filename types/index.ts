export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserDto {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

export interface VenuePhotoDto {
  id: string;
  googlePlaceId: string;
  displayOrder: number;
  photoUrl: string | null;
}

export interface PricingItemDto {
  id: string;
  category: string | null;
  title: string;
  subtitle: string | null;
  price: number;
  displayOrder: number;
}

export interface PricingItemRequest {
  category?: string | null;
  title: string;
  subtitle?: string | null;
  price: number;
  displayOrder: number;
}

export interface UpdateVenuePricingRequest {
  items: PricingItemRequest[];
}

export interface VenueDto {
  id: string;
  name: string;
  address: string;
  capacity: number;
  userId: string;
  venueTypeId: string;
  photos: VenuePhotoDto[];
  averageRating: number | null;
  ratingCount: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  description: string | null;
  pricingItems: PricingItemDto[];
}

export interface UpdateVenueRequest {
  name: string;
  address: string;
  capacity: number;
  venueTypeId: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
}

export interface AddVenuePhotoRequest {
  googlePlaceId: string;
  displayOrder: number;
}

export interface ReorderVenuePhotosRequest {
  items: PhotoOrderItem[];
}

export interface PhotoOrderItem {
  photoId: string;
  displayOrder: number;
}

export interface VenueTypeDto {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
}

export type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Cancelled";

export interface BookingDto {
  id: string;
  venueId: string;
  customerId: string;
  startUtc: string;
  endUtc: string;
  partySize: number;
  status: BookingStatus;
  venueComment: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface BookingDecisionRequest {
  note?: string | null;
}

export interface CancelBookingRequest {
  reason?: string | null;
}

export interface UpdateUserRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface LoginResponse {
  user: UserDto;
  token: string;
  customerId: string | null;
  venueId: string | null;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  traceId: string;
}

export interface SimpleError {
  message: string;
}

// ─── Customer types ───────────────────────────────────────────────

export interface CustomerPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerVenuePhotoDto {
  photoUrl: string | null;
  displayOrder: number;
}

export interface CustomerVenueDto {
  id: string;
  name: string;
  address: string;
  capacity: number;
  photos: CustomerVenuePhotoDto[];
  averageRating: number | null;
  ratingCount: number;
  venueTypeId: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  description: string | null;
  pricingItems: PricingItemDto[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  user: UserDto;
  customer: CustomerDto;
  token: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  locale: "en" | "el";
  createdAtUtc: string;
  pushToken: string | null;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  locale?: "en" | "el";
}

export interface AvailabilitySlot {
  startUtc: string;
  endUtc: string;
}

export interface CreateBookingRequest {
  venueId: string;
  customerId: string;
  startUtc: string;
  endUtc: string;
  partySize: number;
}

export interface PendingRatingDto {
  bookingId: string;
  venueId: string;
  venueName: string;
  bookingEndUtc: string;
}

export interface RateVenueRequest {
  bookingId: string;
  value: number;
}

export interface VenueRulesDto {
  autoConfirm: boolean;
  slotMinutes: number;
  openHour: number;
  closeHour: number;
}

export type UpdateVenueRulesRequest = VenueRulesDto;
