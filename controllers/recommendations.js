const prisma = require('../libs/prisma');
const mapProduct = require('../mappers/product');

module.exports = async function recommendationsList(ctx) {
  const allTopRated = await prisma.product.findMany({
    where: {rating: 5},
  });

  const recommendations = allTopRated
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  ctx.body = {recommendations: recommendations.map(mapProduct)};
};
