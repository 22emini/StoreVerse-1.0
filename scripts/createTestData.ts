import { prisma } from '../lib/prisma';

async function main() {
  // Create a user (required for store foreign key)
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      name: 'Test User',
    },
  });
  console.log('Created user:', user.id);

  // Create a store linked to the user
  const store = await prisma.store.create({
    data: {
      userId: user.id,
      storeName: 'Test Store',
    },
  });
  console.log('Created store:', store.id);

  // Create a campaign linked to the store
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Test Campaign',
      channel: 'email',
      customerSegment: 'all',
      messageContent: 'Hello, this is a test campaign.',
      storeId: store.id,
    },
  });
  console.log('Created campaign:', campaign.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
