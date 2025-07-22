import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// User onboarding progress tracking
export const userOnboarding = pgTable('user_onboarding', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  currentStep: integer('current_step').default(1),
  isCompleted: boolean('is_completed').default(false),
  interests: jsonb('interests').$type<string[]>(), // User selected interests
  learningStyle: text('learning_style'), // visual, auditory, kinesthetic, reading
  experienceLevel: text('experience_level'), // beginner, intermediate, advanced
  goals: jsonb('goals').$type<string[]>(), // career goals, learning objectives
  timeCommitment: text('time_commitment'), // casual, regular, intensive
  preferredCommunities: jsonb('preferred_communities').$type<number[]>(), // Community IDs
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Onboarding recommendations for communities
export const onboardingRecommendations = pgTable('onboarding_recommendations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  communityId: integer('community_id').notNull(),
  score: integer('score').default(0), // Recommendation strength 0-100
  reason: text('reason'), // Why recommended
  isJoined: boolean('is_joined').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Onboarding step definitions
export const onboardingSteps = pgTable('onboarding_steps', {
  id: serial('id').primaryKey(),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  componentType: text('component_type').notNull(), // interests, learning_style, goals, etc.
  options: jsonb('options').$type<{label: string, value: string, icon?: string}[]>(),
  isRequired: boolean('is_required').default(true),
  isActive: boolean('is_active').default(true),
});

// Create schemas for validation
export const insertUserOnboardingSchema = createInsertSchema(userOnboarding);
export const selectUserOnboardingSchema = createSelectSchema(userOnboarding);
export const insertOnboardingRecommendationSchema = createInsertSchema(onboardingRecommendations);
export const selectOnboardingRecommendationSchema = createSelectSchema(onboardingRecommendations);

// Types
export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;
export type OnboardingRecommendation = typeof onboardingRecommendations.$inferSelect;
export type InsertOnboardingRecommendation = z.infer<typeof insertOnboardingRecommendationSchema>;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;