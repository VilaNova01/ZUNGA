import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  return user?.role === 'ADMIN' ? user : null;
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const { productId, featured, status } = await req.json();
  const data: any = {};
  if (featured !== undefined) data.featured = featured;
  if (status) data.status = status;

  const product = await prisma.product.update({ where: { id: productId }, data });
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const { productId } = await req.json();
  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
