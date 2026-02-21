const prisma = require('../libs/prisma');
const mapCategory = require('../mappers/category');

module.exports = async function categoryList(ctx) {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  ctx.body = {categories: categories.map(mapCategory)};
};
