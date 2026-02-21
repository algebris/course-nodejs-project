const Router = require('koa-router');
const handleValidationError = require('./middlewares/validationErrors');
const mustBeAuthenticated = require('./middlewares/mustBeAuthenticated');
const {
  productsBySubcategory, productsByQuery, productList, productBySlug
} = require('./controllers/products');

const router = new Router({prefix: '/api'});


router.get('/recommendations', require('./controllers/recommendations'));
router.get('/categories', require('./controllers/categories'));
router.get('/products', productsBySubcategory, productsByQuery, productList);
router.get('/products/:slug', productBySlug);


router.post('/login', require('./controllers/login'));
router.get('/oauth/:provider', require('./controllers/oauth').oauth);
router.post('/oauth_callback', handleValidationError, require('./controllers/oauth').oauthCallback);


router.get('/me', mustBeAuthenticated, require('./controllers/me'));
router.get('/messages', mustBeAuthenticated, require('./controllers/messages'));


router.post('/register', handleValidationError, require('./controllers/registration').register);
router.post('/confirm', require('./controllers/registration').confirm);


router.get('/orders', mustBeAuthenticated, require('./controllers/orders').ordersList);
router.post('/orders', mustBeAuthenticated, handleValidationError, require('./controllers/orders').checkout);

module.exports = router;
