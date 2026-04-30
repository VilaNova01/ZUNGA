import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { role } = await req.json();
  if (role !== 'BUYER' && role !== 'SELLER') {
    return NextResponse.json({ error: 'Role inválido.' }, { status: 400 });
  }

  const status = role === 'SELLER' ? 'PENDING' : 'ACTIVE';

  await prisma.user.update({
    where: { email: session.user.email },
    data: { role, status },
  });

  return NextResponse.json({ ok: true, role, status });
}
