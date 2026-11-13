"use client"

import type { BlogPost } from "@/lib/dummy-data"

import { useFilteredPosts } from "../hooks/use-filtered-posts"
import { PostList } from "./post-list"

export function PostListWithSearch({ posts }: { posts: BlogPost[] }) {
  const filteredPosts = useFilteredPosts(posts)
  return <PostList posts={filteredPosts} />
}
