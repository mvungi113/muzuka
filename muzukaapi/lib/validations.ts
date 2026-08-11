import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const songSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  artistId: z.string().uuid(),
  albumId: z.string().uuid().optional(),
  genreId: z.string().uuid().optional(),
  moodIds: z.array(z.string().uuid()).optional(),
  releaseDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).optional(),
});

export const artistSchema = z.object({
  name: z.string().min(1).max(200),
  biography: z.string().max(5000).optional(),
});

export const albumSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  artistId: z.string().uuid(),
  releaseDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).optional(),
});

export const genreSchema = z.object({
  name: z.string().min(1).max(100),
});

export const moodSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().max(7).optional(),
  icon: z.string().max(50).optional(),
});

export const playlistSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
});

export const addToPlaylistSchema = z.object({
  songId: z.string().uuid(),
});

export const historySchema = z.object({
  songId: z.string().uuid(),
  durationPlayed: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});
