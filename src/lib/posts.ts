'use client' // Needed for localStorage access

import type { BlogPost, BlogPostInput } from './types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const STORAGE_KEY = 'blogPosts';

// Helper function to safely get posts from localStorage
const getStoredPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') {
    // Return empty array during SSR or environments without window
    return [];
  }
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error reading posts from localStorage:', error);
    return [];
  }
};

// Helper function to safely save posts to localStorage
const saveStoredPosts = (posts: BlogPost[]): void => {
   if (typeof window === 'undefined') {
     console.warn('Cannot save posts to localStorage: window is not defined.');
     return;
   }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts to localStorage:', error);
     // Optionally, notify the user or implement a fallback
  }
};

// --- CRUD Operations ---

// Get all posts
export const getPosts = async (): Promise<BlogPost[]> => {
  // Simulate async operation if needed, otherwise just return
  // await new Promise(resolve => setTimeout(resolve, 50)); // Optional delay
  return getStoredPosts();
};

// Get a single post by ID
export const getPostById = async (id: string): Promise<BlogPost | null> => {
  const posts = getStoredPosts();
  const post = posts.find(p => p.id === id);
  return post || null;
};

// Create a new post
export const createPost = async (newPostData: BlogPostInput): Promise<BlogPost> => {
  const posts = getStoredPosts();
  const newPost: BlogPost = {
    ...newPostData,
    id: uuidv4(), // Generate a unique ID
    date: newPostData.date || new Date().toISOString(), // Ensure date is set
  };
  const updatedPosts = [...posts, newPost];
  saveStoredPosts(updatedPosts);
  return newPost;
};

// Update an existing post
export const updatePost = async (id: string, updatedPostData: BlogPostInput): Promise<BlogPost | null> => {
  const posts = getStoredPosts();
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    console.warn(`Post with id ${id} not found for update.`);
    return null; // Post not found
  }

  const updatedPost: BlogPost = {
    ...posts[postIndex], // Keep original ID and potentially other fields
    ...updatedPostData, // Overwrite with new data
     date: updatedPostData.date || new Date().toISOString(), // Ensure date is updated or set
  };

  const updatedPosts = [...posts];
  updatedPosts[postIndex] = updatedPost;
  saveStoredPosts(updatedPosts);
  return updatedPost;
};

// Delete a post by ID
export const deletePost = async (id: string): Promise<boolean> => {
  const posts = getStoredPosts();
  const initialLength = posts.length;
  const updatedPosts = posts.filter(p => p.id !== id);

  if (updatedPosts.length === initialLength) {
     console.warn(`Post with id ${id} not found for deletion.`);
     return false; // Post not found, nothing deleted
  }

  saveStoredPosts(updatedPosts);
  return true; // Deletion successful
};
