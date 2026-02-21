const prisma = require('../libs/prisma');
const mapOrder = require('../mappers/order');
const sendMail = require('../libs/sendMail');
const config = require('../config');

module.exports.checkout = async function checkout(ctx, next) {
  const {product: productSlug, phone, address} = ctx.request.body || {};
  const errors = {};

  if (!productSlug) {
    errors.product = 'Не выбран товар';
  }

  if (!phone || !/\+?\d{6,14}/.test(phone)) {
    errors.phone = 'Неверный формат номера телефона.';
  }

  if (!address || String(address).trim().length < 5) {
    errors.address = 'Неверный адрес доставки.';
  }

  if (Object.keys(errors).length > 0) {
    ctx.status = 400;
    ctx.body = {errors};
    return;
  }

  const product = await prisma.product.findUnique({where: {slug: productSlug}});

  if (!product) {
    ctx.status = 400;
    ctx.body = {errors: {product: 'Товар не найден'}};
    return;
  }
  
  const order = await prisma.order.create({
    data: {
      userId: ctx.user.id,
      productId: product.id,
      phone,
      address,
    },
  });
  
  await sendMail({
    to: {
      name: ctx.user.displayName,
      address: ctx.user.email,
    },
    subject: 'Подтверждение заказа',
    locals: {href: config.domain, product: product.title, price: `${product.price}₽`},
    template: 'order',
  });

  ctx.body = {order: order.id};
};

module.exports.ordersList = async function ordersList(ctx) {
  const orders = await prisma.order.findMany({
    where: {userId: ctx.user.id},
    include: {product: true},
    take: 20,
    orderBy: {id: 'desc'},
  });

  ctx.body = {orders: orders.map(mapOrder)};
};
