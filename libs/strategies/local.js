const LocalStrategy = require('passport-local').Strategy;
const prisma = require('../../libs/prisma');
const {verifyPassword} = require('../../libs/password');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      try {
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) {
          return done(null, false, 'Нет такого пользователя');
        }
        
        if (!user.passwordHash) {
          return done(null, false, 'Для пользователя не задан пароль, войдите с помощью социальной сети');
        }

        const isValidPassword = await verifyPassword(user, password);

        if (!isValidPassword) {
          return done(null, false, 'Невереный пароль');
        }

        if (user.verificationToken) {
          return done(null, false, 'Подтвердите email');
        }

        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
);
