import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { include: { children: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}
