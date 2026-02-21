const {v4: uuid} = require('uuid');
const prisma = require('../libs/prisma');

module.exports = async (ctx, next) => {
  ctx.login = async function(user) {
    const token = uuid();
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        lastVisit: new Date(),
      },
    });
    
    return token;
  };
  
  return next();
};
