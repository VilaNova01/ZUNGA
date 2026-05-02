import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  await prisma.like.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });

  return NextResponse.json({ ok: true });
}
