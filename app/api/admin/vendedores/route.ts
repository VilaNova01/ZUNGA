import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  return user?.role === 'ADMIN' ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const sellers = await prisma.user.findMany({
    where: { role: 'SELLER' },
    select: { id: true, name: true, email: true, phone: true, status: true, isPremium: true, premiumUntil: true, province: true, createdAt: true, _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(sellers);
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const { userId, status, isPremium } = await req.json();
  const data: any = {};
  if (status) data.status = status;
  if (isPremium !== undefined) {
    data.isPremium = isPremium;
    if (isPremium) data.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const user = await prisma.user.update({ where: { id: userId }, data });

  if (status === 'ACTIVE') {
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACCOUNT_APPROVED',
        message: 'A tua conta de vendedor foi aprovada! Já podes publicar os teus produtos.',
      },
    });
  } else if (status === 'SUSPENDED') {
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACCOUNT_SUSPENDED',
        message: 'A tua conta de vendedor foi suspensa. Contacta o suporte para mais informações.',
      },
    });
  }

  return NextResponse.json({ ok: true, user });
}
