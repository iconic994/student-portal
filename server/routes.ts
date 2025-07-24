import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertAssignmentSchema, insertLiveSessionSchema, insertDiscussionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseWithModules(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = parseInt(req.params.id);
      
      const enrollment = await storage.enrollUser({
        userId,
        courseId,
        progress: "0",
        completedModules: 0,
      });
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling user:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // User enrollment routes
  app.get('/api/user/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Module routes
  app.get('/api/courses/:courseId/modules', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const modules = await storage.getCourseModules(courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get('/api/modules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.post('/api/modules/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moduleId = parseInt(req.params.id);
      const { watchTime, isCompleted } = req.body;
      
      await storage.updateModuleProgress(userId, moduleId, watchTime, isCompleted);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Assignment routes
  app.get('/api/user/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignments = await storage.getUserAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/assignments/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignmentId = parseInt(req.params.id);
      const { content } = req.body;
      
      const submission = await storage.submitAssignment({
        assignmentId,
        userId,
        content,
        status: "submitted",
        attemptNumber: 1,
      });
      
      res.json(submission);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // Live session routes
  app.get('/api/user/live-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserLiveSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ message: "Failed to fetch live sessions" });
    }
  });

  // Certificate routes
  app.get('/api/user/certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Discussion routes
  app.get('/api/courses/:courseId/discussions', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const discussions = await storage.getCourseDiscussions(courseId);
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  app.get('/api/modules/:moduleId/discussions', isAuthenticated, async (req: any, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const discussions = await storage.getModuleDiscussions(moduleId);
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  app.post('/api/discussions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const discussion = await storage.createDiscussion({
        ...req.body,
        userId,
      });
      res.json(discussion);
    } catch (error) {
      console.error("Error creating discussion:", error);
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });

  // Notification routes
  app.get('/api/user/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Resource routes
  app.get('/api/modules/:moduleId/resources', isAuthenticated, async (req: any, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const resources = await storage.getModuleResources(moduleId);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Notes routes
  app.post('/api/modules/:moduleId/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moduleId = parseInt(req.params.moduleId);
      const { content } = req.body;
      
      const note = await storage.saveUserNotes(userId, moduleId, content);
      res.json(note);
    } catch (error) {
      console.error("Error saving notes:", error);
      res.status(500).json({ message: "Failed to save notes" });
    }
  });

  app.get('/api/modules/:moduleId/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moduleId = parseInt(req.params.moduleId);
      
      const notes = await storage.getUserNotes(userId, moduleId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Community routes
  app.get('/api/communities', async (req, res) => {
    try {
      const { category, limit } = req.query;
      const communities = await storage.getCommunities(
        limit ? parseInt(limit as string) : 20,
        category as string
      );
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.get('/api/communities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const community = await storage.getCommunity(id);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });

  app.post('/api/communities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityData = { ...req.body, createdBy: userId };
      const community = await storage.createCommunity(communityData);
      
      // Auto-join creator as admin
      await storage.joinCommunity(userId, community.id);
      
      res.status(201).json(community);
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.post('/api/communities/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.joinCommunity(userId, communityId);
      res.json({ message: "Successfully joined community" });
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.delete('/api/communities/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.leaveCommunity(userId, communityId);
      res.json({ message: "Successfully left community" });
    } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ message: "Failed to leave community" });
    }
  });

  app.get('/api/communities/:id/posts', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { limit } = req.query;
      
      const posts = await storage.getCommunityPosts(
        communityId,
        limit ? parseInt(limit as string) : 20
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/communities/:id/posts', isAuthenticated, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is member
      const isMember = await storage.isCommunityMember(userId, communityId);
      if (!isMember) {
        return res.status(403).json({ message: "Must be a community member to post" });
      }
      
      const postData = { ...req.body, communityId, authorId: userId };
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const commentData = { ...req.body, postId, authorId: userId };
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post('/api/:targetType/:id/react', isAuthenticated, async (req: any, res) => {
    try {
      const targetType = req.params.targetType; // 'posts' or 'comments'
      const targetId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { reactionType = 'like' } = req.body;
      
      const cleanTargetType = targetType === 'posts' ? 'post' : 'comment';
      await storage.toggleReaction(userId, cleanTargetType, targetId, reactionType);
      res.json({ message: "Reaction toggled successfully" });
    } catch (error) {
      console.error("Error toggling reaction:", error);
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });

  app.get('/api/user/communities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communities = await storage.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ message: "Failed to fetch user communities" });
    }
  });

  // Gamification routes
  app.get('/api/user/points', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const points = await storage.getUserPoints(userId);
      res.json(points || {
        userId,
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        level: 1,
        currentLevelPoints: 0,
        pointsToNextLevel: 100,
      });
    } catch (error) {
      console.error("Error fetching user points:", error);
      res.status(500).json({ message: "Failed to fetch user points" });
    }
  });

  app.get('/api/user/points/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const history = await storage.getUserPointsHistory(userId, limit ? parseInt(limit as string) : 20);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get('/api/user/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/user/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.get('/api/user/streaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streaks = await storage.getUserStreaks(userId);
      res.json(streaks);
    } catch (error) {
      console.error("Error fetching user streaks:", error);
      res.status(500).json({ message: "Failed to fetch user streaks" });
    }
  });

  app.get('/api/leaderboard/:type/:period', async (req, res) => {
    try {
      const { type, period } = req.params;
      const { limit } = req.query;
      const leaderboard = await storage.getLeaderboard(type, period, limit ? parseInt(limit as string) : 10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Gamification actions
  app.post('/api/award-points', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { points, action, description, sourceType, sourceId } = req.body;
      
      await storage.awardPoints(userId, points, action, description, sourceType, sourceId);
      await storage.checkAndCompleteAchievements(userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });

  // Enhanced community routes with gamification
  app.post('/api/communities/:id/posts', isAuthenticated, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is member
      const isMember = await storage.isCommunityMember(userId, communityId);
      if (!isMember) {
        return res.status(403).json({ message: "Must be a community member to post" });
      }
      
      const postData = { ...req.body, communityId, authorId: userId };
      const post = await storage.createPost(postData);
      
      // Award points for creating a post
      await storage.awardPoints(userId, 10, 'post_created', 'Created a community post', 'community', communityId);
      await storage.updateStreak(userId, 'community_activity');
      await storage.checkAndCompleteAchievements(userId);
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const commentData = { ...req.body, postId, authorId: userId };
      const comment = await storage.createComment(commentData);
      
      // Award points for commenting
      await storage.awardPoints(userId, 5, 'comment_added', 'Added a comment', 'post', postId);
      await storage.updateStreak(userId, 'community_activity');
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post('/api/:targetType/:id/react', isAuthenticated, async (req: any, res) => {
    try {
      const targetType = req.params.targetType;
      const targetId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { reactionType = 'like' } = req.body;
      
      const cleanTargetType = targetType === 'posts' ? 'post' : 'comment';
      await storage.toggleReaction(userId, cleanTargetType, targetId, reactionType);
      
      // Award points for reacting (but prevent spam by checking if reaction was added, not removed)
      await storage.awardPoints(userId, 2, 'reaction_added', 'Reacted to content', cleanTargetType, targetId);
      
      res.json({ message: "Reaction toggled successfully" });
    } catch (error) {
      console.error("Error toggling reaction:", error);
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });

  // Onboarding routes
  app.get('/api/onboarding/steps', isAuthenticated, async (req: any, res) => {
    try {
      const steps = await storage.getOnboardingSteps();
      res.json(steps);
    } catch (error) {
      console.error("Error fetching onboarding steps:", error);
      res.status(500).json({ message: "Failed to fetch onboarding steps" });
    }
  });

  app.get('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboarding = await storage.getUserOnboarding(userId);
      res.json(onboarding);
    } catch (error) {
      console.error("Error fetching user onboarding:", error);
      res.status(500).json({ message: "Failed to fetch onboarding progress" });
    }
  });

  app.post('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboarding = await storage.createUserOnboarding({
        userId,
        currentStep: 1,
        ...req.body
      });
      res.json(onboarding);
    } catch (error) {
      console.error("Error creating onboarding:", error);
      res.status(500).json({ message: "Failed to create onboarding" });
    }
  });

  app.put('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboarding = await storage.updateUserOnboarding(userId, req.body);
      
      // Generate recommendations if completed
      if (req.body.isCompleted && req.body.interests && req.body.interests.length > 0) {
        const communities = await storage.getCommunities();
        const recommendations = generateCommunityRecommendations(communities, req.body);
        if (recommendations.length > 0) {
          await storage.createOnboardingRecommendations(userId, recommendations);
        }
      }
      
      res.json(onboarding);
    } catch (error) {
      console.error("Error updating onboarding:", error);
      res.status(500).json({ message: "Failed to update onboarding" });
    }
  });

  app.get('/api/user/onboarding/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getOnboardingRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track session participants
  const sessionParticipants = new Map<string, Set<any>>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    let currentSession: string | null = null;
    let userId: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join_session':
            currentSession = data.sessionId;
            userId = data.userId;
            
            if (currentSession && userId) {
              // Add participant to session
              if (!sessionParticipants.has(currentSession)) {
                sessionParticipants.set(currentSession, new Set());
              }
              const participants = sessionParticipants.get(currentSession);
              if (participants) {
                participants.add({
                  userId,
                  username: data.username,
                  ws
                });
                
                // Broadcast participant joined
                broadcastToSession(currentSession, {
                  type: 'participant_joined',
                  userId,
                  username: data.username,
                  participantCount: participants.size
                });
              }
            }
            
            console.log(`User ${data.username} joined session ${currentSession}`);
            break;
            
          case 'leave_session':
            if (currentSession && sessionParticipants.has(currentSession)) {
              const participants = sessionParticipants.get(currentSession);
              if (participants) {
                participants.forEach((participant: any) => {
                  if (participant.userId === userId) {
                    participants.delete(participant);
                  }
                });
                
                // Broadcast participant left
                broadcastToSession(currentSession, {
                  type: 'participant_left',
                  userId,
                  participantCount: participants.size
                });
              }
            }
            break;
            
          case 'chat_message':
            // Broadcast chat message to session participants
            if (currentSession) {
              broadcastToSession(currentSession, {
                type: 'chat_message',
                id: data.id,
                author: data.author,
                message: data.message,
                timestamp: data.timestamp
              });
            }
            break;
            
          case 'raise_hand':
            // Broadcast hand raise status
            if (currentSession) {
              broadcastToSession(currentSession, {
                type: 'hand_raised',
                userId: data.userId,
                username: data.username,
                handRaised: data.handRaised
              });
            }
            break;
            
          case 'webrtc_offer':
            // Forward WebRTC offer to specific peer
            if (currentSession && data.targetUserId) {
              forwardToUser(currentSession, data.targetUserId, {
                type: 'webrtc_offer',
                fromUserId: userId,
                offer: data.offer
              });
            }
            break;
            
          case 'webrtc_answer':
            // Forward WebRTC answer to specific peer
            if (currentSession && data.targetUserId) {
              forwardToUser(currentSession, data.targetUserId, {
                type: 'webrtc_answer',
                fromUserId: userId,
                answer: data.answer
              });
            }
            break;
            
          case 'webrtc_ice_candidate':
            // Forward ICE candidate to specific peer
            if (currentSession && data.targetUserId) {
              forwardToUser(currentSession, data.targetUserId, {
                type: 'webrtc_ice_candidate',
                fromUserId: userId,
                candidate: data.candidate
              });
            }
            break;
            
          case 'video_toggle':
            // Broadcast video toggle status
            if (currentSession) {
              broadcastToSession(currentSession, {
                type: 'participant_video_toggle',
                userId: data.userId,
                videoEnabled: data.videoEnabled
              });
            }
            break;
            
          case 'audio_toggle':
            // Broadcast audio toggle status
            if (currentSession) {
              broadcastToSession(currentSession, {
                type: 'participant_audio_toggle',
                userId: data.userId,
                audioEnabled: data.audioEnabled
              });
            }
            break;
            
          case 'media_state_change':
            // Broadcast media state changes (mute/unmute, video on/off)
            if (currentSession) {
              broadcastToSession(currentSession, {
                type: 'participant_media_change',
                userId: data.userId,
                mediaType: data.mediaType, // 'audio' or 'video'
                enabled: data.enabled
              });
            }
            break;
            
          default:
            // Broadcast other messages to session
            if (currentSession) {
              broadcastToSession(currentSession, data);
            }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Clean up participant from session
      if (currentSession && sessionParticipants.has(currentSession)) {
        const participants = sessionParticipants.get(currentSession);
        if (participants) {
          participants.forEach((participant: any) => {
            if (participant.ws === ws) {
              participants.delete(participant);
            }
          });
          
          // Broadcast participant left
          broadcastToSession(currentSession, {
            type: 'participant_left',
            userId,
            participantCount: participants.size
          });
          
          // Remove empty sessions
          if (participants.size === 0) {
            sessionParticipants.delete(currentSession);
          }
        }
      }
    });
  });
  
  function broadcastToSession(sessionId: string, message: any, excludeWs: any = null) {
    if (!sessionId || !sessionParticipants.has(sessionId)) return;
    
    const participants = sessionParticipants.get(sessionId);
    if (participants) {
      participants.forEach((participant: any) => {
        if (participant.ws !== excludeWs && participant.ws.readyState === 1) {
          participant.ws.send(JSON.stringify(message));
        }
      });
    }
  }
  
  function forwardToUser(sessionId: string, targetUserId: string, message: any) {
    if (!sessionId || !sessionParticipants.has(sessionId)) return;
    
    const participants = sessionParticipants.get(sessionId);
    if (participants) {
      participants.forEach((participant: any) => {
        if (participant.userId === targetUserId && participant.ws.readyState === 1) {
          participant.ws.send(JSON.stringify(message));
        }
      });
    }
  }

  return httpServer;
}

// Helper function to generate community recommendations based on user preferences
function generateCommunityRecommendations(communities: any[], userProfile: any): any[] {
  const recommendations = [];
  const interests = userProfile.interests || [];
  const experienceLevel = userProfile.experienceLevel || 'beginner';
  const goals = userProfile.goals || [];

  // Interest matching scores
  const interestMap: Record<string, string[]> = {
    'web_development': ['JavaScript Developers', 'Frontend Masters', 'Full Stack', 'React Community'],
    'data_science': ['Data Scientists', 'Python Analytics', 'ML Engineers'],
    'mobile_development': ['Mobile Developers', 'React Native', 'Flutter Community'],
    'machine_learning': ['AI/ML Hub', 'Deep Learning', 'Data Scientists'],
    'ui_ux_design': ['Design Community', 'UX/UI Designers', 'Creative Hub'],
    'cloud_computing': ['Cloud Engineers', 'DevOps Community', 'AWS/Azure'],
    'cybersecurity': ['Security Experts', 'Ethical Hackers', 'InfoSec'],
    'digital_marketing': ['Marketing Professionals', 'Growth Hackers'],
    'business_strategy': ['Business Leaders', 'Entrepreneurs', 'Strategy'],
    'photography': ['Creative Hub', 'Visual Arts', 'Photography']
  };

  for (const community of communities) {
    let score = 0;
    let reasons = [];

    // Check interest matching
    for (const interest of interests) {
      const matchingCategories = interestMap[interest] || [];
      if (matchingCategories.some(cat => 
        community.community.name.toLowerCase().includes(cat.toLowerCase()) ||
        community.community.category.toLowerCase().includes(interest.replace('_', ' '))
      )) {
        score += 40;
        reasons.push(`Matches your interest in ${interest.replace('_', ' ')}`);
        break;
      }
    }

    // Experience level matching
    const communityName = community.community.name.toLowerCase();
    if (experienceLevel === 'beginner' && (
      communityName.includes('beginner') || 
      communityName.includes('learning') ||
      communityName.includes('study')
    )) {
      score += 20;
      reasons.push('Perfect for beginners');
    } else if (experienceLevel === 'advanced' && (
      communityName.includes('advanced') ||
      communityName.includes('expert') ||
      communityName.includes('professional')
    )) {
      score += 20;
      reasons.push('Suitable for advanced learners');
    }

    // Goal alignment
    for (const goal of goals) {
      if (goal === 'career_change' && communityName.includes('career')) {
        score += 15;
        reasons.push('Great for career transitions');
      } else if (goal === 'skill_enhancement' && communityName.includes('skill')) {
        score += 15;
        reasons.push('Focused on skill development');
      }
    }

    // Community activity bonus
    if (community.community.memberCount > 100) {
      score += 10;
      reasons.push('Active community');
    }

    // Only recommend if score is meaningful
    if (score >= 30) {
      recommendations.push({
        communityId: community.community.id,
        score: Math.min(score, 100),
        reason: reasons.join(', ')
      });
    }
  }

  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
