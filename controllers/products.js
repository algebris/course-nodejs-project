const prisma = require('../libs/prisma');
const mapProduct = require('../mappers/product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;

  if (!subcategory) return next();

  const products = await prisma.product.findMany({
    where: {subcategory},
    take: 20,
    orderBy: {id: 'asc'},
  });

  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const {query} = ctx.query;
  if (!query) return next();
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        {title: {contains: query, mode: 'insensitive'}},
        {description: {contains: query, mode: 'insensitive'}},
      ],
    },
    take: 20,
    orderBy: {id: 'asc'},
  });

  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await prisma.product.findMany({
    take: 20,
    orderBy: {id: 'asc'},
  });

  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productBySlug = async function productById(ctx, next) {
  const product = await prisma.product.findUnique({
    where: {slug: ctx.params.slug},
  });

  if (!product) {
    ctx.throw(404, `no product with ${ctx.params.slug} slug`);
  }

  ctx.body = {product: mapProduct(product)};
};
