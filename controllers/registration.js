const {v4: uuid} = require('uuid');
const prisma = require('../libs/prisma');
const {createPasswordHash} = require('../libs/password');
const sendMail = require('../libs/sendMail');
const config = require('../config');

module.exports.register = async (ctx, next) => {
  const {email, displayName, password} = ctx.request.body || {};
  const errors = {};

  if (!email || !/^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(email)) {
    errors.email = 'Некорректный email.';
  }

  if (!displayName || String(displayName).trim().length < 2) {
    errors.displayName = 'У пользователя должно быть имя';
  }

  if (!password || String(password).length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }

  if (Object.keys(errors).length > 0) {
    ctx.status = 400;
    ctx.body = {errors};
    return;
  }

  const verificationToken = uuid();
  const passwordData = await createPasswordHash(password);
  let user;

  try {
    user = await prisma.user.create({
      data: {
        email,
        displayName: String(displayName).trim(),
        verificationToken,
        passwordHash: passwordData.passwordHash,
        salt: passwordData.salt,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const duplicateFields = Array.isArray(err.meta && err.meta.target) ? err.meta.target : [];
      const conflictErrors = {};

      if (duplicateFields.includes('email')) {
        conflictErrors.email = 'Такой email уже существует';
      }

      if (duplicateFields.includes('displayName')) {
        conflictErrors.displayName = 'Такое имя уже существует';
      }

      ctx.status = 400;
      ctx.body = {errors: conflictErrors};
      return;
    }

    throw err;
  }

  await sendMail({
    to: {
      name: user.displayName,
      address: user.email,
    },
    subject: 'Подтвердите почту',
    locals: {href: `${config.domain}/confirm/${verificationToken}`},
    template: 'confirmation',
  });

  ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
  const verificationToken = ctx.request.body && ctx.request.body.verificationToken;

  if (!verificationToken) {
    ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');
  }

  const user = await prisma.user.findUnique({
    where: {verificationToken},
  });

  if (!user) {
    ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');
  }

  await prisma.user.update({
    where: {id: user.id},
    data: {verificationToken: null},
  });
  
  const token = await ctx.login(user);
  
  ctx.body = {token};
};
