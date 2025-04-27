// src/lib/types.ts

export interface BlogPost {
  id: string; // Unique identifier (e.g., UUID or timestamp-based)
  title: string;
  content: string;
  date: string; // ISO string date format for easy sorting/parsing
}

// Type for creating/updating posts (omits id as it's generated or existing)
export type BlogPostInput = Omit<BlogPost, 'id'>;
