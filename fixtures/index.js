const prisma = require('../libs/prisma');
const {createPasswordHash} = require('../libs/password');
const users = require('./users');
const categories = require('./categories');
const products = require('./products');

(async () => {
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    const passwordData = await createPasswordHash(user.password);

    await prisma.user.create({
      data: {
        email: user.email,
        displayName: user.displayName,
        passwordHash: passwordData.passwordHash,
        salt: passwordData.salt,
        verificationToken: null,
      },
    });
  }

  for (const category of categories) {
    await prisma.category.create({
      data: {
        title: category.title,
        slug: category.slug,
        subcategories: {
          create: category.subcategories.map((subcategory) => ({
            title: subcategory.title,
            slug: subcategory.slug,
          })),
        },
      },
    });
  }

  for (const product of products) {
    await prisma.product.create({
      data: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        details: product.details,
        price: product.price,
        discount: product.discount,
        category: product.category,
        subcategory: product.subcategory,
        images: product.images,
        rating: product.rating,
        reviews: product.reviews,
      },
    });
  }

  await prisma.$disconnect();

  console.log(`${users.length} users have been saved in DB`);
  console.log(`${categories.length} categories have been saved in DB`);
  console.log(`${products.length} products have been saved in DB`);
})();
