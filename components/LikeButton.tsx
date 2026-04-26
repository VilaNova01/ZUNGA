'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LikeButton({ productId, initialLikes }: { productId: string; initialLikes: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  async function toggle() {
    if (!session) { router.push('/login'); return; }
    const res = await fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    const data = await res.json();
    setLiked(data.liked);
    setLikes(l => data.liked ? l + 1 : l - 1);
  }

  return (
    <button onClick={toggle} className="flex items-center gap-1 hover:text-red-500 transition-colors">
      <Heart size={15} className={liked ? 'fill-red-500 text-red-500' : ''} />
      <span>{likes} likes</span>
    </button>
  );
}
