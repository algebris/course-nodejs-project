const prisma = require('../libs/prisma');

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = async function session(ctx, next) {
  const header = ctx.request.get('Authorization');
  if (!header) return next();
  
  const token = header.split(' ')[1];
  if (!token) return next();
  
  const session = await prisma.session.findUnique({
    where: {token},
    include: {user: true},
  });

  if (!session) {
    ctx.throw(401, 'Неверный аутентификационный токен');
  }

  const now = Date.now();
  const lastVisitTs = new Date(session.lastVisit).getTime();

  if ((now - lastVisitTs) > SESSION_TTL_MS) {
    await prisma.session.delete({where: {token}});
    ctx.throw(401, 'Сессия истекла');
  }

  await prisma.session.update({
    where: {token},
    data: {lastVisit: new Date()},
  });
  
  ctx.user = session.user;
  return next();
};
