import type { BlogPost } from "@/lib/dummy-data"

import { PostCard } from "./post-card"

export function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="relative pt-4">
      <div className="absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
        <div className="border-r border-line" />
        <div className="border-l border-line" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post, index) => (
          <PostCard
            key={post.slug}
            post={post}
            imageLoading={index <= 3 ? "eager" : "lazy"}
          />
        ))}

        {posts.length === 0 && (
          <div className="screen-line-top screen-line-bottom p-4">
            <p className="font-mono text-sm">No posts found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
