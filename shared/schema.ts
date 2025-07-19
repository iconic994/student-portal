import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("student"), // student, instructor, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").notNull(),
  imageUrl: varchar("image_url"),
  totalModules: integer("total_modules").default(0),
  duration: varchar("duration"), // e.g., "6 weeks"
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  status: varchar("status").default("active"), // active, archived
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url"),
  duration: integer("duration_minutes"),
  orderIndex: integer("order_index").notNull(),
  isLocked: boolean("is_locked").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  completedModules: integer("completed_modules").default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

export const moduleProgress = pgTable("module_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  isCompleted: boolean("is_completed").default(false),
  watchTime: integer("watch_time_seconds").default(0),
  completedAt: timestamp("completed_at"),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  moduleId: integer("module_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // quiz, project, essay
  maxScore: integer("max_score").default(100),
  timeLimit: integer("time_limit_minutes"),
  dueDate: timestamp("due_date"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: jsonb("content"), // answers, file urls, etc.
  score: integer("score"),
  feedback: text("feedback"),
  status: varchar("status").default("pending"), // pending, graded, submitted
  attemptNumber: integer("attempt_number").default(1),
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedAt: timestamp("graded_at"),
});

export const liveSessions = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  endTime: timestamp("end_time"),
  meetingUrl: varchar("meeting_url"),
  status: varchar("status").default("scheduled"), // scheduled, live, ended
  recordingUrl: varchar("recording_url"),
  maxParticipants: integer("max_participants").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionAttendance = pgTable("session_attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  duration: integer("duration_minutes"),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  templateData: jsonb("template_data"), // certificate details
  pdfUrl: varchar("pdf_url"),
});

export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id"),
  moduleId: integer("module_id"),
  userId: varchar("user_id").notNull(),
  title: varchar("title"),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // for replies
  isInstructor: boolean("is_instructor").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // assignment, session, course, general
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"), // course id, assignment id, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, ppt, doc, etc.
  fileSize: integer("file_size_bytes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  certificates: many(certificates),
  discussions: many(discussions),
  notifications: many(notifications),
  assignmentSubmissions: many(assignmentSubmissions),
  sessionAttendance: many(sessionAttendance),
  moduleProgress: many(moduleProgress),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  modules: many(courseModules),
  enrollments: many(enrollments),
  assignments: many(assignments),
  liveSessions: many(liveSessions),
  discussions: many(discussions),
  certificates: many(certificates),
}));

export const moduleRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  progress: many(moduleProgress),
  resources: many(resources),
  discussions: many(discussions),
}));

export const enrollmentRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  lastAccessedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  submittedAt: true,
  gradedAt: true,
});

export const insertLiveSessionSchema = createInsertSchema(liveSessions).omit({
  id: true,
  createdAt: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseModule = typeof courseModules.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type LiveSession = typeof liveSessions.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Discussion = typeof discussions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type ModuleProgress = typeof moduleProgress.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
