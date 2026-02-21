const prisma = require('../../libs/prisma');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    return done(null, false, 'Не указан email');
  }

  try {
    let user = await prisma.user.findUnique({where: {email}});

    if (user) {
      return done(null, user);
    }

    const baseDisplayName = (displayName || email.split('@')[0] || 'user').trim();
    let candidateDisplayName = baseDisplayName;
    let index = 1;

    while (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email,
            displayName: candidateDisplayName,
            verificationToken: null,
          },
        });
      } catch (err) {
        if (err.code === 'P2002' && Array.isArray(err.meta && err.meta.target)) {
          if (err.meta.target.includes('displayName')) {
            candidateDisplayName = `${baseDisplayName}${index++}`;
            continue;
          }

          if (err.meta.target.includes('email')) {
            user = await prisma.user.findUnique({where: {email}});
            continue;
          }
        }

        throw err;
      }
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
};
