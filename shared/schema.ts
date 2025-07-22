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

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Community tables
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  category: varchar("category", { length: 100 }).notNull(),
  isPublic: boolean("is_public").default(true),
  memberCount: integer("member_count").default(0),
  postCount: integer("post_count").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role", { length: 50 }).default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  authorId: varchar("author_id").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("text"), // text, image, video, link, poll
  attachments: jsonb("attachments"), // Array of attachment URLs
  tags: text("tags").array(), // Array of tags
  isPinned: boolean("is_pinned").default(false),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For nested replies
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityReactions = pgTable("community_reactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // post, comment
  targetId: integer("target_id").notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // like, love, laugh, wow, sad, angry
  createdAt: timestamp("created_at").defaultNow(),
});

// Community types
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = typeof communityMembers.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;
export type CommunityReaction = typeof communityReactions.$inferSelect;
export type InsertCommunityReaction = typeof communityReactions.$inferInsert;

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

// Gamification tables
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
  weeklyPoints: integer("weekly_points").default(0),
  monthlyPoints: integer("monthly_points").default(0),
  level: integer("level").default(1),
  currentLevelPoints: integer("current_level_points").default(0),
  pointsToNextLevel: integer("points_to_next_level").default(100),
  weekStartDate: timestamp("week_start_date").defaultNow(),
  monthStartDate: timestamp("month_start_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  points: integer("points").notNull(),
  action: varchar("action").notNull(), // post_created, comment_added, post_liked, etc.
  description: text("description"),
  sourceType: varchar("source_type"), // community, course, assignment
  sourceId: integer("source_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"), // icon name or URL
  color: varchar("color").default("#3B82F6"), // hex color
  rarity: varchar("rarity").default("common"), // common, rare, epic, legendary
  criteria: jsonb("criteria"), // conditions to earn this badge
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  isVisible: boolean("is_visible").default(true),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  category: varchar("category"), // social, learning, consistency, milestone
  pointsReward: integer("points_reward").default(0),
  badgeReward: integer("badge_reward"), // optional badge ID
  criteria: jsonb("criteria"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"), // percentage
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  streakType: varchar("streak_type").notNull(), // daily_login, weekly_post, study_streak
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // weekly_points, monthly_points, community_contributions
  period: varchar("period").notNull(), // current_week, current_month, all_time
  userId: varchar("user_id").notNull(),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  metadata: jsonb("metadata"), // additional data like community name, etc.
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Gamification types
export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;
export type PointsHistory = typeof pointsHistory.$inferSelect;
export type InsertPointsHistory = typeof pointsHistory.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = typeof streaks.$inferInsert;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = typeof leaderboards.$inferInsert;

// Gamification insert schemas
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  updatedAt: true,
});

export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  lastUpdated: true,
});

export const insertStreakSchema = createInsertSchema(streaks).omit({
  id: true,
  updatedAt: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  calculatedAt: true,
});
