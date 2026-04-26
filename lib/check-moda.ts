import { prisma } from './prisma';

async function main() {
  await prisma.category.update({ where: { slug: 'moda' }, data: { icon: '👔|👗|👟|⌚' } });
  console.log('✅ Ícone actualizado para mosaico 👔|👗|👟|⌚');
}

main().finally(() => prisma.$disconnect());
