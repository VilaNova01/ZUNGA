import { prisma } from './prisma';

async function migrate() {
  console.log('🔄 A limpar categorias antigas...');

  await prisma.$executeRaw`PRAGMA foreign_keys = OFF`;

  // Apagar todos os filhos (e netos) das categorias afectadas
  for (const slug of ['moda-masculino', 'moda-feminino', 'esporte', 'bebes']) {
    const cat = await prisma.category.findUnique({ where: { slug }, include: { children: { include: { children: true } } } });
    if (!cat) { console.log(`  ⚠ Não encontrado: ${slug}`); continue; }

    for (const child of cat.children) {
      for (const grand of child.children) {
        await prisma.category.delete({ where: { id: grand.id } });
      }
      await prisma.category.delete({ where: { id: child.id } });
    }
    console.log(`  ✓ Limpo: ${slug}`);
  }

  await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  console.log('✅ Pronto. A correr seed...');
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
