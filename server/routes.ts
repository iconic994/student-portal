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

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'join_session':
            // Handle joining live session
            ws.send(JSON.stringify({
              type: 'session_joined',
              sessionId: data.sessionId
            }));
            break;
            
          case 'chat_message':
            // Broadcast chat message to all clients in the session
            wss.clients.forEach((client) => {
              if (client.readyState === 1) { // WebSocket.OPEN
                client.send(JSON.stringify({
                  type: 'chat_message',
                  message: data.message,
                  author: data.author,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;
            
          case 'raise_hand':
            // Handle raise hand functionality
            wss.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'hand_raised',
                  userId: data.userId,
                  username: data.username
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
