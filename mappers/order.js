const mapProduct = require('./product');

module.exports = function mapOrder(order) {
  return {
    id: order.id,
    user: order.user || order.userId,
    product: mapProduct(order.product),
    phone: order.phone,
    address: order.address,
  };
};
