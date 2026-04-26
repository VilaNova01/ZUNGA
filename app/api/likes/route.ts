import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { productId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });

  const existing = await prisma.like.findUnique({ where: { userId_productId: { userId: user.id, productId } } });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.like.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ liked: true });
  }
}
