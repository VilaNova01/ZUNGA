import { prisma } from './prisma';
import { CATEGORIES } from './categories';
import bcrypt from 'bcryptjs';

function toSlug(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function seed() {
  console.log('🌱 A criar dados iniciais...');

  const adminPw = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@zunga.ao' },
    update: {},
    create: { name: 'Admin ZUNGA', email: 'admin@zunga.ao', password: adminPw, role: 'ADMIN', status: 'ACTIVE' },
  });

  for (const cat of CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, icon: cat.icon },
    });

    for (const child of cat.children) {
      if (typeof child === 'string') {
        const childSlug = `${cat.slug}-${toSlug(child)}`;
        await prisma.category.upsert({
          where: { slug: childSlug },
          update: {},
          create: { name: child, slug: childSlug, icon: cat.icon, parentId: parent.id },
        });
      } else {
        const midSlug = `${cat.slug}-${toSlug(child.name)}`;
        const midCat = await prisma.category.upsert({
          where: { slug: midSlug },
          update: {},
          create: { name: child.name, slug: midSlug, icon: cat.icon, parentId: parent.id },
        });
        for (const grandchild of child.children || []) {
          const grandSlug = `${midSlug}-${toSlug(grandchild)}`;
          await prisma.category.upsert({
            where: { slug: grandSlug },
            update: {},
            create: { name: grandchild, slug: grandSlug, icon: cat.icon, parentId: midCat.id },
          });
        }
      }
    }
  }

  // Configurações padrão da plataforma
  const defaultSettings = [
    { key: 'contact_whatsapp', value: '244934023228' },
    { key: 'premium_price',    value: '5000' },
    { key: 'bank_name',        value: 'BAI' },
    { key: 'bank_holder',      value: 'ZUNGA, LDA' },
    { key: 'bank_iban',        value: 'AO06 0040 0000 0000 0000 0000 0' },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log('✅ Dados iniciais criados!');
  console.log('   Admin: admin@zunga.ao / admin123');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
