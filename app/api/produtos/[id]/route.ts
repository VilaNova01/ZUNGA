import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, phone: true, city: true, province: true, avatar: true, bio: true, isPremium: true, createdAt: true } },
      category: true,
      _count: { select: { likes: true } },
    },
  });
  if (!product) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  if (product.sellerId !== user?.id && user?.role !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
