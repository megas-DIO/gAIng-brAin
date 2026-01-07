import { z } from "zod";

export const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().min(1),
  kind: z.enum(["fact", "decision", "task", "note", "preference", "prompt", "warning"]),
  title: z.string().optional().nullable(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  pinned: z.boolean().optional().nullable()
});

export const querySchema = z.object({
  query: z.string().min(1),
  top_k: z.number().int().min(1).max(200).optional(),
  threshold: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional()
});

export const roleCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  capabilities: z.array(z.string()).optional().nullable()
});

export const roleUpdateSchema = roleCreateSchema.partial();

export const workerCreateSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["idle", "busy", "offline", "error"]).optional().default("idle"),
  capabilities: z.array(z.string()).optional().nullable()
});

export const workerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["idle", "busy", "offline", "error"]).optional(),
  capabilities: z.array(z.string()).optional().nullable()
});

export const assignmentSchema = z.object({
  roleIds: z.array(z.string().uuid()).min(1)
});
