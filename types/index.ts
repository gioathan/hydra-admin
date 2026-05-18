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
}

export interface VenuePhotoDto {
  id: string;
  googlePlaceId: string;
  displayOrder: number;
  photoUrl: string | null;
}

export interface VenueDto {
  id: string;
  name: string;
  address: string;
  capacity: number;
  userId: string;
  venueTypeId: string;
  photos: VenuePhotoDto[];
}

export interface UpdateVenueRequest {
  name: string;
  address: string;
  capacity: number;
  venueTypeId: string;
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

export interface VenueRulesDto {
  autoConfirm: boolean;
  slotMinutes: number;
  openHour: number;
  closeHour: number;
}

export type UpdateVenueRulesRequest = VenueRulesDto;
