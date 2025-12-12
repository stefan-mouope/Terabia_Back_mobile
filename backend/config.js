module.exports = {
  DB_USER: process.env.DB_USER || 'your_db_user',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_DATABASE: process.env.DB_DATABASE || 'your_db_name',
  DB_PASSWORD: process.env.DB_PASSWORD || 'your_db_password',
  DB_PORT: process.env.DB_PORT || 5432,
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
};
