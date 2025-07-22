import {
  users,
  courses,
  courseModules,
  enrollments,
  assignments,
  assignmentSubmissions,
  liveSessions,
  sessionAttendance,
  certificates,
  discussions,
  notifications,
  resources,
  moduleProgress,
  notes,
  communities,
  communityMembers,
  communityPosts,
  communityComments,
  communityReactions,
  userPoints,
  pointsHistory,
  badges,
  userBadges,
  achievements,
  userAchievements,
  streaks,
  leaderboards,
  type User,
  type UpsertUser,
  type Course,
  type CourseModule,
  type Enrollment,
  type Assignment,
  type AssignmentSubmission,
  type LiveSession,
  type Certificate,
  type Discussion,
  type Notification,
  type Resource,
  type ModuleProgress,
  type Community,
  type CommunityPost,
  type CommunityComment,
  type CommunityReaction,
  type UserPoints,
  type PointsHistory,
  type Badge,
  type UserBadge,
  type Achievement,
  type UserAchievement,
  type Streak,
  type Leaderboard,
  type InsertCourse,
  type InsertModule,
  type InsertEnrollment,
  type InsertAssignment,
  type InsertSubmission,
  type InsertLiveSession,
  type InsertDiscussion,
  type InsertNotification,
  type InsertResource,
  type InsertCommunity,
  type InsertCommunityPost,
  type InsertCommunityComment,
  type InsertCommunityReaction,
  type InsertUserPoints,
  type InsertPointsHistory,
  type InsertBadge,
  type InsertUserBadge,
  type InsertAchievement,
  type InsertUserAchievement,
  type InsertStreak,
  type InsertLeaderboard,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseWithModules(id: number): Promise<any>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Module operations
  getCourseModules(courseId: number): Promise<CourseModule[]>;
  getModule(id: number): Promise<CourseModule | undefined>;
  createModule(module: InsertModule): Promise<CourseModule>;
  
  // Enrollment operations
  getUserEnrollments(userId: string): Promise<any[]>;
  enrollUser(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(userId: string, courseId: number, progress: number): Promise<void>;
  
  // Assignment operations
  getCourseAssignments(courseId: number): Promise<Assignment[]>;
  getUserAssignments(userId: string): Promise<any[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  submitAssignment(submission: InsertSubmission): Promise<AssignmentSubmission>;
  
  // Live session operations
  getLiveSessions(): Promise<LiveSession[]>;
  getUserLiveSessions(userId: string): Promise<any[]>;
  createLiveSession(session: InsertLiveSession): Promise<LiveSession>;
  
  // Certificate operations
  getUserCertificates(userId: string): Promise<Certificate[]>;
  createCertificate(userId: string, courseId: number): Promise<Certificate>;
  
  // Discussion operations
  getCourseDiscussions(courseId: number): Promise<Discussion[]>;
  getModuleDiscussions(moduleId: number): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  
  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
  // Resource operations
  getModuleResources(moduleId: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Progress tracking
  updateModuleProgress(userId: string, moduleId: number, watchTime: number, isCompleted: boolean): Promise<void>;
  getUserModuleProgress(userId: string, moduleId: number): Promise<ModuleProgress | undefined>;
  
  // Gamification operations
  getUserPoints(userId: string): Promise<UserPoints | undefined>;
  awardPoints(userId: string, points: number, action: string, description?: string, sourceType?: string, sourceId?: number): Promise<void>;
  getUserPointsHistory(userId: string, limit?: number): Promise<PointsHistory[]>;
  
  // Badge operations  
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<any[]>;
  awardBadge(userId: string, badgeId: number): Promise<void>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<any[]>;
  updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<void>;
  checkAndCompleteAchievements(userId: string): Promise<void>;
  
  // Streak operations
  getUserStreaks(userId: string): Promise<Streak[]>;
  updateStreak(userId: string, streakType: string): Promise<void>;
  
  // Leaderboard operations
  getLeaderboard(type: string, period: string, limit?: number): Promise<any[]>;
  updateLeaderboards(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.status, "active"));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourseWithModules(id: number): Promise<any> {
    const course = await db.select().from(courses).where(eq(courses.id, id));
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, id))
      .orderBy(courseModules.orderIndex);

    return {
      ...course[0],
      modules,
    };
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  // Module operations
  async getCourseModules(courseId: number): Promise<CourseModule[]> {
    return await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.orderIndex);
  }

  async getModule(id: number): Promise<CourseModule | undefined> {
    const [module] = await db.select().from(courseModules).where(eq(courseModules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<CourseModule> {
    const [newModule] = await db.insert(courseModules).values(module).returning();
    return newModule;
  }

  // Enrollment operations
  async getUserEnrollments(userId: string): Promise<any[]> {
    return await db
      .select({
        enrollment: enrollments,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));
  }

  async enrollUser(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async updateEnrollmentProgress(userId: string, courseId: number, progress: number): Promise<void> {
    await db
      .update(enrollments)
      .set({ 
        progress: progress.toString(),
        lastAccessedAt: new Date()
      })
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
  }

  // Assignment operations
  async getCourseAssignments(courseId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.courseId, courseId));
  }

  async getUserAssignments(userId: string): Promise<any[]> {
    return await db
      .select({
        assignment: assignments,
        course: courses,
        submission: assignmentSubmissions,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .leftJoin(
        assignmentSubmissions,
        and(
          eq(assignmentSubmissions.assignmentId, assignments.id),
          eq(assignmentSubmissions.userId, userId)
        )
      )
      .where(
        eq(courses.id, sql`ANY(SELECT course_id FROM enrollments WHERE user_id = ${userId})`)
      );
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async submitAssignment(submission: InsertSubmission): Promise<AssignmentSubmission> {
    const [newSubmission] = await db.insert(assignmentSubmissions).values(submission).returning();
    return newSubmission;
  }

  // Live session operations
  async getLiveSessions(): Promise<LiveSession[]> {
    return await db.select().from(liveSessions).orderBy(desc(liveSessions.scheduledAt));
  }

  async getUserLiveSessions(userId: string): Promise<any[]> {
    return await db
      .select({
        session: liveSessions,
        course: courses,
      })
      .from(liveSessions)
      .innerJoin(courses, eq(liveSessions.courseId, courses.id))
      .where(
        eq(courses.id, sql`ANY(SELECT course_id FROM enrollments WHERE user_id = ${userId})`)
      )
      .orderBy(liveSessions.scheduledAt);
  }

  async createLiveSession(session: InsertLiveSession): Promise<LiveSession> {
    const [newSession] = await db.insert(liveSessions).values(session).returning();
    return newSession;
  }

  // Certificate operations
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const results = await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issuedAt));
    return results;
  }

  async createCertificate(userId: string, courseId: number): Promise<Certificate> {
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [certificate] = await db
      .insert(certificates)
      .values({
        userId,
        courseId,
        certificateNumber,
        templateData: {},
      })
      .returning();
    return certificate;
  }

  // Discussion operations
  async getCourseDiscussions(courseId: number): Promise<Discussion[]> {
    return await db
      .select()
      .from(discussions)
      .where(eq(discussions.courseId, courseId))
      .orderBy(desc(discussions.createdAt));
  }

  async getModuleDiscussions(moduleId: number): Promise<Discussion[]> {
    return await db
      .select()
      .from(discussions)
      .where(eq(discussions.moduleId, moduleId))
      .orderBy(desc(discussions.createdAt));
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    const [newDiscussion] = await db.insert(discussions).values(discussion).returning();
    return newDiscussion;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Resource operations
  async getModuleResources(moduleId: number): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.moduleId, moduleId));
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  // Notes operations
  async saveUserNotes(userId: string, moduleId: number, content: string): Promise<any> {
    const existing = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.moduleId, moduleId)));

    if (existing.length > 0) {
      const [updatedNote] = await db
        .update(notes)
        .set({ content, updatedAt: new Date() })
        .where(and(eq(notes.userId, userId), eq(notes.moduleId, moduleId)))
        .returning();
      return updatedNote;
    } else {
      const [newNote] = await db
        .insert(notes)
        .values({ userId, moduleId, content })
        .returning();
      return newNote;
    }
  }

  async getUserNotes(userId: string, moduleId: number): Promise<any> {
    const [userNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.moduleId, moduleId)));
    return userNote || null;
  }

  // Community operations
  async getCommunities(limit = 20, category?: string): Promise<any[]> {
    const query = db
      .select({
        community: communities,
        memberCount: communities.memberCount,
        postCount: communities.postCount,
      })
      .from(communities)
      .orderBy(desc(communities.createdAt))
      .limit(limit);
    
    if (category) {
      query.where(eq(communities.category, category));
    }
    
    return await query;
  }

  async getCommunity(id: number): Promise<any> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, id));
    return community;
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const [newCommunity] = await db
      .insert(communities)
      .values(community)
      .returning();
    return newCommunity;
  }

  async joinCommunity(userId: string, communityId: number): Promise<void> {
    // Check if already member
    const existing = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.userId, userId), eq(communityMembers.communityId, communityId)));
    
    if (existing.length === 0) {
      await db.insert(communityMembers).values({
        userId,
        communityId,
        role: 'member'
      });
      
      // Update member count
      await db
        .update(communities)
        .set({ memberCount: sql`${communities.memberCount} + 1` })
        .where(eq(communities.id, communityId));
    }
  }

  async leaveCommunity(userId: string, communityId: number): Promise<void> {
    await db
      .delete(communityMembers)
      .where(and(eq(communityMembers.userId, userId), eq(communityMembers.communityId, communityId)));
    
    // Update member count
    await db
      .update(communities)
      .set({ memberCount: sql`${communities.memberCount} - 1` })
      .where(eq(communities.id, communityId));
  }

  async isCommunityMember(userId: string, communityId: number): Promise<boolean> {
    const [member] = await db
      .select()
      .from(communityMembers)
      .where(and(eq(communityMembers.userId, userId), eq(communityMembers.communityId, communityId)));
    return !!member;
  }

  async getCommunityPosts(communityId: number, limit = 20): Promise<any[]> {
    return await db
      .select({
        post: communityPosts,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        likeCount: communityPosts.likeCount,
        commentCount: communityPosts.commentCount,
        shareCount: communityPosts.shareCount,
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.authorId, users.id))
      .where(eq(communityPosts.communityId, communityId))
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
      .limit(limit);
  }

  async createPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    
    // Update post count
    await db
      .update(communities)
      .set({ postCount: sql`${communities.postCount} + 1` })
      .where(eq(communities.id, post.communityId));
    
    return newPost;
  }

  async getPostComments(postId: number): Promise<any[]> {
    return await db
      .select({
        comment: communityComments,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(communityComments)
      .leftJoin(users, eq(communityComments.authorId, users.id))
      .where(eq(communityComments.postId, postId))
      .orderBy(communityComments.createdAt);
  }

  async createComment(comment: InsertCommunityComment): Promise<CommunityComment> {
    const [newComment] = await db
      .insert(communityComments)
      .values(comment)
      .returning();
    
    // Update comment count
    await db
      .update(communityPosts)
      .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    return newComment;
  }

  async toggleReaction(userId: string, targetType: string, targetId: number, reactionType: string): Promise<void> {
    // Check if reaction exists
    const existing = await db
      .select()
      .from(communityReactions)
      .where(and(
        eq(communityReactions.userId, userId),
        eq(communityReactions.targetType, targetType),
        eq(communityReactions.targetId, targetId)
      ));

    if (existing.length > 0) {
      // Remove existing reaction
      await db
        .delete(communityReactions)
        .where(and(
          eq(communityReactions.userId, userId),
          eq(communityReactions.targetType, targetType),
          eq(communityReactions.targetId, targetId)
        ));
      
      // Update count
      if (targetType === 'post') {
        await db
          .update(communityPosts)
          .set({ likeCount: sql`${communityPosts.likeCount} - 1` })
          .where(eq(communityPosts.id, targetId));
      } else if (targetType === 'comment') {
        await db
          .update(communityComments)
          .set({ likeCount: sql`${communityComments.likeCount} - 1` })
          .where(eq(communityComments.id, targetId));
      }
    } else {
      // Add new reaction
      await db.insert(communityReactions).values({
        userId,
        targetType,
        targetId,
        reactionType
      });
      
      // Update count
      if (targetType === 'post') {
        await db
          .update(communityPosts)
          .set({ likeCount: sql`${communityPosts.likeCount} + 1` })
          .where(eq(communityPosts.id, targetId));
      } else if (targetType === 'comment') {
        await db
          .update(communityComments)
          .set({ likeCount: sql`${communityComments.likeCount} + 1` })
          .where(eq(communityComments.id, targetId));
      }
    }
  }

  async getUserCommunities(userId: string): Promise<any[]> {
    return await db
      .select({
        community: communities,
        memberRole: communityMembers.role,
        joinedAt: communityMembers.joinedAt,
      })
      .from(communityMembers)
      .leftJoin(communities, eq(communityMembers.communityId, communities.id))
      .where(eq(communityMembers.userId, userId))
      .orderBy(desc(communityMembers.joinedAt));
  }

  // Progress tracking
  async updateModuleProgress(userId: string, moduleId: number, watchTime: number, isCompleted: boolean): Promise<void> {
    const existing = await db
      .select()
      .from(moduleProgress)
      .where(and(eq(moduleProgress.userId, userId), eq(moduleProgress.moduleId, moduleId)));

    if (existing.length > 0) {
      await db
        .update(moduleProgress)
        .set({
          watchTime,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        })
        .where(and(eq(moduleProgress.userId, userId), eq(moduleProgress.moduleId, moduleId)));
    } else {
      await db.insert(moduleProgress).values({
        userId,
        moduleId,
        watchTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      });
    }
  }

  async getUserModuleProgress(userId: string, moduleId: number): Promise<ModuleProgress | undefined> {
    const [progress] = await db
      .select()
      .from(moduleProgress)
      .where(and(eq(moduleProgress.userId, userId), eq(moduleProgress.moduleId, moduleId)));
    return progress;
  }

  // Gamification operations
  async getUserPoints(userId: string): Promise<UserPoints | undefined> {
    const [points] = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId));
    return points;
  }

  async awardPoints(userId: string, points: number, action: string, description?: string, sourceType?: string, sourceId?: number): Promise<void> {
    // First ensure user has points record
    const existingPoints = await this.getUserPoints(userId);
    
    if (!existingPoints) {
      await db.insert(userPoints).values({
        userId,
        totalPoints: points,
        weeklyPoints: points,
        monthlyPoints: points,
        level: 1,
        currentLevelPoints: points,
        pointsToNextLevel: Math.max(0, 100 - points),
      });
    } else {
      // Calculate level progression
      const newTotal = (existingPoints.totalPoints ?? 0) + points;
      const currentLevel = existingPoints.level ?? 1;
      const newLevelPoints = (existingPoints.currentLevelPoints ?? 0) + points;
      
      // Simple leveling system: 100 points for level 1, +50 per level
      let level = currentLevel;
      let levelPoints = newLevelPoints;
      let pointsForNextLevel = existingPoints.pointsToNextLevel ?? 100;
      
      while (levelPoints >= pointsForNextLevel && pointsForNextLevel > 0) {
        levelPoints -= pointsForNextLevel;
        level++;
        pointsForNextLevel = 100 + (level - 1) * 50; // Increasing requirements
      }
      
      await db
        .update(userPoints)
        .set({
          totalPoints: newTotal,
          weeklyPoints: (existingPoints.weeklyPoints ?? 0) + points,
          monthlyPoints: (existingPoints.monthlyPoints ?? 0) + points,
          level,
          currentLevelPoints: levelPoints,
          pointsToNextLevel: pointsForNextLevel - levelPoints,
          updatedAt: new Date(),
        })
        .where(eq(userPoints.userId, userId));
    }

    // Record points history
    await db.insert(pointsHistory).values({
      userId,
      points,
      action,
      description,
      sourceType,
      sourceId,
    });
  }

  async getUserPointsHistory(userId: string, limit: number = 20): Promise<PointsHistory[]> {
    return await db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt))
      .limit(limit);
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .where(eq(badges.isActive, true))
      .orderBy(badges.name);
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return await db
      .select({
        badge: badges,
        earnedAt: userBadges.earnedAt,
        isVisible: userBadges.isVisible,
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(userId: string, badgeId: number): Promise<void> {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    
    if (existing.length === 0) {
      await db.insert(userBadges).values({
        userId,
        badgeId,
      });
    }
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.name);
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    return await db
      .select({
        achievement: achievements,
        progress: userAchievements.progress,
        isCompleted: userAchievements.isCompleted,
        completedAt: userAchievements.completedAt,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.completedAt));
  }

  async updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<void> {
    const existing = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));

    if (existing.length > 0) {
      await db
        .update(userAchievements)
        .set({
          progress: progress.toString(),
          isCompleted: progress >= 100,
          completedAt: progress >= 100 ? new Date() : null,
          lastUpdated: new Date(),
        })
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
    } else {
      await db.insert(userAchievements).values({
        userId,
        achievementId,
        progress: progress.toString(),
        isCompleted: progress >= 100,
        completedAt: progress >= 100 ? new Date() : null,
      });
    }
  }

  async checkAndCompleteAchievements(userId: string): Promise<void> {
    // This would contain logic to check various achievement criteria
    // For now, implement basic ones
    const userStats = await this.getUserPoints(userId);
    const userBadgesCount = (await this.getUserBadges(userId)).length;
    
    if (userStats) {
      // Points milestone achievements
      if ((userStats.totalPoints ?? 0) >= 100) {
        await this.updateAchievementProgress(userId, 1, 100); // First 100 points
      }
      if ((userStats.totalPoints ?? 0) >= 500) {
        await this.updateAchievementProgress(userId, 2, 100); // 500 points milestone
      }
      
      // Level achievements
      if ((userStats.level ?? 1) >= 5) {
        await this.updateAchievementProgress(userId, 3, 100); // Reach level 5
      }
    }
  }

  // Streak operations
  async getUserStreaks(userId: string): Promise<Streak[]> {
    return await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId));
  }

  async updateStreak(userId: string, streakType: string): Promise<void> {
    const existing = await db
      .select()
      .from(streaks)
      .where(and(eq(streaks.userId, userId), eq(streaks.streakType, streakType)));

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (existing.length > 0) {
      const streak = existing[0];
      const lastActivity = streak.lastActivityDate;
      
      if (lastActivity) {
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day - extend streak
          const newStreak = (streak.currentStreak ?? 0) + 1;
          await db
            .update(streaks)
            .set({
              currentStreak: newStreak,
              longestStreak: Math.max(streak.longestStreak ?? 0, newStreak),
              lastActivityDate: today,
              updatedAt: new Date(),
            })
            .where(eq(streaks.id, streak.id));
        } else if (daysDiff > 1) {
          // Streak broken - reset
          await db
            .update(streaks)
            .set({
              currentStreak: 1,
              lastActivityDate: today,
              updatedAt: new Date(),
            })
            .where(eq(streaks.id, streak.id));
        }
        // If daysDiff === 0, same day - no update needed
      }
    } else {
      // Create new streak
      await db.insert(streaks).values({
        userId,
        streakType,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      });
    }
  }

  // Leaderboard operations
  async getLeaderboard(type: string, period: string, limit: number = 10): Promise<any[]> {
    return await db
      .select({
        rank: leaderboards.rank,
        score: leaderboards.score,
        user: users,
        metadata: leaderboards.metadata,
      })
      .from(leaderboards)
      .leftJoin(users, eq(leaderboards.userId, users.id))
      .where(and(eq(leaderboards.type, type), eq(leaderboards.period, period)))
      .orderBy(leaderboards.rank)
      .limit(limit);
  }

  async updateLeaderboards(): Promise<void> {
    // Update weekly points leaderboard
    const weeklyLeaders = await db
      .select({
        userId: userPoints.userId,
        weeklyPoints: userPoints.weeklyPoints,
      })
      .from(userPoints)
      .orderBy(desc(userPoints.weeklyPoints))
      .limit(100);

    // Clear existing weekly leaderboard
    await db.delete(leaderboards).where(and(
      eq(leaderboards.type, 'weekly_points'),
      eq(leaderboards.period, 'current_week')
    ));

    // Insert new rankings
    for (let i = 0; i < weeklyLeaders.length; i++) {
      await db.insert(leaderboards).values({
        type: 'weekly_points',
        period: 'current_week',
        userId: weeklyLeaders[i].userId,
        rank: i + 1,
        score: weeklyLeaders[i].weeklyPoints ?? 0,
      });
    }

    // Update monthly leaderboard
    const monthlyLeaders = await db
      .select({
        userId: userPoints.userId,
        monthlyPoints: userPoints.monthlyPoints,
      })
      .from(userPoints)
      .orderBy(desc(userPoints.monthlyPoints))
      .limit(100);

    await db.delete(leaderboards).where(and(
      eq(leaderboards.type, 'monthly_points'),
      eq(leaderboards.period, 'current_month')
    ));

    for (let i = 0; i < monthlyLeaders.length; i++) {
      await db.insert(leaderboards).values({
        type: 'monthly_points',
        period: 'current_month',
        userId: monthlyLeaders[i].userId,
        rank: i + 1,
        score: monthlyLeaders[i].monthlyPoints ?? 0,
      });
    }
  }
}

export const storage = new DatabaseStorage();
