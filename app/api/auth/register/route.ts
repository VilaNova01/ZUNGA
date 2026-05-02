import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json();
  const name     = body.name?.trim();
  const email    = body.email?.trim() || null;
  const phone    = body.phone?.trim() || null;
  const password = body.password;
  const role     = body.role;
  if (!name || !password) return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ error: 'Indica um email ou número de telefone.' }, { status: 400 });

  if (email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return NextResponse.json({ error: 'Email já registado.' }, { status: 400 });
  }
  if (phone) {
    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) return NextResponse.json({ error: 'Número de telefone já registado.' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const status = role === 'SELLER' ? 'PENDING' : 'ACTIVE';

  const user = await prisma.user.create({
    data: { name, email: email || null, password: hash, phone: phone || null, role: role || 'BUYER', status },
  });

  return NextResponse.json({ ok: true, userId: user.id, status });
}
