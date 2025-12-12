const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'postgresql://neondb_owner:npg_wBWvKHt76uOG@ep-sweet-feather-ad21g1ot-pooler.c-2.us-east-1.aws.neon.tech/neondb',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  }
);

sequelize.createSchema('auth', { logging: false }).catch(() => {});

module.exports = sequelize;
