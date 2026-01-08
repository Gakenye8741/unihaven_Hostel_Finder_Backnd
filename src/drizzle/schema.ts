import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  decimal,
  primaryKey,
  AnyPgColumn
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { unique } from "drizzle-orm/pg-core";

// ==========================================
// 1. ENUMS
// ==========================================
export const roomStatusEnum = pgEnum("room_status", ["Available", "Full", "Maintenance"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["Per Month", "Per Semester"]);
export const userRole = pgEnum("user_role", ["Student", "Owner", "Admin", "Caretaker"]);
export const roomType = pgEnum("room_type", ["Single", "Bedsitter", "One Bedroom", "Two Bedroom"]);
export const bookingStatus = pgEnum("booking_status", ["Pending", "Confirmed", "Cancelled", "Completed"]);
export const paymentStatus = pgEnum("payment_status", ["Pending", "Completed", "Failed"]);
export const genderPolicy = pgEnum("gender_policy", ["Male Only", "Female Only", "Mixed"]);
export const mediaType = pgEnum("media_type", ["Image", "Video"]);
export const GenderEnum = pgEnum("gender", ["male","female","other"]);
export const accountStatusEnum = pgEnum("account_status", [
  "ACTIVE",     // User can log in and use all features
  "PENDING",    // User has registered but hasn't verified email/ID
  "SUSPENDED",  // Temporary ban (e.g., pending investigation)
  "BANNED",     // Permanent ban for scammers
  "DEACTIVATED" // User closed their own account
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "NOT_SUBMITTED", 
  "PENDING",    
  "APPROVED",   
  "REJECTED"    
]);
// ==========================================
// 2. TABLES
// ==========================================

// ======================= USERS ==========================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }), 
  whatsappPhone: varchar("whatsapp_phone", { length: 20 }), 
  
  gender: GenderEnum("gender"),
  role: userRole("role").default("Student").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  
  // --- VERIFICATION & SAFETY ---
  emailVerified: boolean("email_verified").default(false),
  isIdentityVerified: boolean("is_identity_verified").default(false), 
  
  // Verification Images (Required for Owners/Caretakers)
  idFrontImageUrl: text("id_front_image_url"), 
  idBackImageUrl: text("id_back_image_url"),   
  passportImageUrl: text("passport_image_url"), 
  
  identityVerificationStatus: verificationStatusEnum("identity_verification_status").default("NOT_SUBMITTED"),
  verificationRemarks: text("verification_remarks"),
  idNumber: varchar("id_number", { length: 50 }), 
  
  // --- ACCOUNT STATUS & MODERATION ---
  accountStatus: accountStatusEnum("account_status").default("ACTIVE").notNull(),

  // --- ADD THESE COLUMNS ---
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpiresAt: timestamp("reset_password_expires_at"),
  
  // --- AUTH & PROFILE ---
  confirmationCode: varchar("confirmation_code", { length: 255 }),
  confirmationCodeExpiresAt: timestamp("confirmation_code_expires_at"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  visibility: varchar("visibility", { length: 50 }).default("PUBLIC"), 

  // --- HIERARCHY / IMPERSONATION GUARD ---
  // Fix: Explicitly cast 'users.id' to AnyPgColumn to stop circular type errors
  managedBy: uuid("managed_by").references((): AnyPgColumn => users.id), 
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types for Service usage
export type TSelectUser = typeof users.$inferSelect;
export type TInsertUser = typeof users.$inferInsert;

export const hostels = pgTable("hostels", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("ownerId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  campus: varchar("campus", { length: 255 }).notNull(),
  address: text("address").notNull(),
  description: text("description"),
  policy: genderPolicy("policy").notNull().default("Mixed"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const hostelMedia = pgTable("hostelMedia", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostelId").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  type: mediaType("type").default("Image"),
  isThumbnail: boolean("isThumbnail").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const amenities = pgTable("amenities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
});

export const hostelAmenities = pgTable("hostelAmenities", {
  hostelId: uuid("hostelId").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  amenityId: uuid("amenity_id").references(() => amenities.id, { onDelete: "cascade" }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.hostelId, t.amenityId] }),
}));

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostelId").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  label: varchar("label", { length: 50 }).notNull(), 
  floor: varchar("floor", { length: 20 }), 
  block: varchar("block", { length: 50 }), 
  type: roomType("type").notNull(), 
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: billingCycleEnum("billingCycle").default("Per Semester").notNull(), // <--- Added this
  totalSlots: integer("totalSlots").notNull(),
  occupiedSlots: integer("occupiedSlots").default(0),
  status: roomStatusEnum("status").default("Available"),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("studentId").references(() => users.id).notNull(),
  roomId: uuid("roomId").references(() => rooms.id).notNull(),
  status: bookingStatus("status").default("Pending"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  hostelId: uuid("hostelId").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  
  rating: integer("rating").notNull(), // 1 to 5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  
  // Owner Response
  ownerReply: text("ownerReply"),
  repliedAt: timestamp("repliedAt"),

  // Metadata
  isVerified: boolean("isVerified").default(false),
  helpfulCount: integer("helpfulCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  // Prevents same user from reviewing same hostel twice
  uniqueUserHostel: unique().on(t.userId, t.hostelId),
}));

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("bookingId").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  mpesaCode: varchar("mpesaCode", { length: 50 }).unique(),
  status: paymentStatus("status").default("Pending"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ==========================================
// 3. DETAILED RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  hostels: many(hostels), // Hostels owned by this user
  bookings: many(bookings), // Bookings made by this user
  reviews: many(reviews), // Reviews written by this user
}));

export const hostelsRelations = relations(hostels, ({ one, many }) => ({
  owner: one(users, { fields: [hostels.ownerId], references: [users.id] }),
  media: many(hostelMedia),
  rooms: many(rooms),
  reviews: many(reviews),
  amenities: many(hostelAmenities),
}));

export const hostelMediaRelations = relations(hostelMedia, ({ one }) => ({
  hostel: one(hostels, { fields: [hostelMedia.hostelId], references: [hostels.id] }),
}));

export const hostelAmenitiesRelations = relations(hostelAmenities, ({ one }) => ({
  hostel: one(hostels, { fields: [hostelAmenities.hostelId], references: [hostels.id] }),
  amenity: one(amenities, { fields: [hostelAmenities.amenityId], references: [amenities.id] }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  hostels: many(hostelAmenities),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hostel: one(hostels, { fields: [rooms.hostelId], references: [hostels.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(users, { fields: [bookings.studentId], references: [users.id] }),
  room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
  payment: one(payments), // One booking has one primary payment record
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  hostel: one(hostels, { fields: [reviews.hostelId], references: [hostels.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

// ==========================================
// 4. GROUPED TYPES
// ==========================================

// User Types
export type TSelectUsers = typeof users.$inferSelect;
export type TInsertUsers = typeof users.$inferInsert;

// Hostel & Media Types
export type TSelectHostel = typeof hostels.$inferSelect;
export type TInsertHostel = typeof hostels.$inferInsert;
export type TSelectHostelMedia = typeof hostelMedia.$inferSelect;
export type TInsertHostelMedia = typeof hostelMedia.$inferInsert;

// Room & Amenity Types
export type TSelectRoom = typeof rooms.$inferSelect;
export type TInsertRoom = typeof rooms.$inferInsert;
export type TSelectAmenity = typeof amenities.$inferSelect;
export type TInsertAmenity = typeof amenities.$inferInsert;

// Business Logic Types (Bookings, Payments, Reviews)
export type TSelectBooking = typeof bookings.$inferSelect;
export type TInsertBooking = typeof bookings.$inferInsert;
export type TSelectPayment = typeof payments.$inferSelect;
export type TInsertPayment = typeof payments.$inferInsert;
export type TSelectReview = typeof reviews.$inferSelect;
export type TInsertReview = typeof reviews.$inferInsert;