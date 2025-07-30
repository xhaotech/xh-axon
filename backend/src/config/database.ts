import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  dialect: 'sqlite' | 'mysql' | 'postgres' | 'mariadb';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  storage?: string; // For SQLite
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

// 从环境变量获取数据库配置
const getDatabaseConfig = (): DatabaseConfig => {
  const dbType = (process.env.DB_TYPE || 'sqlite') as DatabaseConfig['dialect'];
  
  const baseConfig = {
    dialect: dbType,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
    },
  };

  switch (dbType) {
    case 'sqlite':
      return {
        ...baseConfig,
        dialect: 'sqlite',
        database: process.env.DB_NAME || 'xh_axon.db',
        storage: process.env.DB_STORAGE || './database/xh_axon.db',
      };
      
    case 'mysql':
      return {
        ...baseConfig,
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME || 'xh_axon',
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
      };
      
    case 'postgres':
      return {
        ...baseConfig,
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'xh_axon',
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };
      
    case 'mariadb':
      return {
        ...baseConfig,
        dialect: 'mariadb',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME || 'xh_axon',
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
      };
      
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
};

// 创建数据库连接
const createSequelizeInstance = (): Sequelize => {
  const config = getDatabaseConfig();
  
  if (config.dialect === 'sqlite') {
    return new Sequelize({
      dialect: 'sqlite',
      storage: config.storage,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: config.pool,
    });
  }
  
  return new Sequelize(
    config.database,
    config.username!,
    config.password!,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: config.pool,
    }
  );
};

export const sequelize = createSequelizeInstance();
export const dbConfig = getDatabaseConfig();

// 测试数据库连接
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully (${dbConfig.dialect})`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// 同步数据库模型
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log(`✅ Database synced successfully (${dbConfig.dialect})`);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};
