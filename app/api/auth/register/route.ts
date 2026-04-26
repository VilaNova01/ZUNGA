import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { name, email, password, phone, role } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'Email já registado.' }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const status = role === 'SELLER' ? 'PENDING' : 'ACTIVE';

  const user = await prisma.user.create({
    data: { name, email, password: hash, phone, role: role || 'BUYER', status },
  });

  return NextResponse.json({ ok: true, userId: user.id, status });
}
