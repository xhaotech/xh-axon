import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// User接口
export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  avatar?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'phone' | 'is_active' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public phone?: string;
  public password_hash!: string;
  public avatar?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Environment接口
export interface EnvironmentAttributes {
  id: string;
  user_id: string;
  name: string;
  variables: Record<string, string>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface EnvironmentCreationAttributes extends Optional<EnvironmentAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

export class Environment extends Model<EnvironmentAttributes, EnvironmentCreationAttributes> implements EnvironmentAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public variables!: Record<string, string>;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

Environment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    variables: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Environment',
    tableName: 'environments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// RequestHistory接口
export interface RequestHistoryAttributes {
  id: string;
  user_id: string;
  name: string;
  url: string;
  method: string;
  params: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  auth?: Record<string, any>;
  response?: Record<string, any>;
  status?: number;
  duration?: number;
  created_at: Date;
}

interface RequestHistoryCreationAttributes extends Optional<RequestHistoryAttributes, 'id' | 'params' | 'headers' | 'body' | 'auth' | 'response' | 'status' | 'duration' | 'created_at'> {}

export class RequestHistory extends Model<RequestHistoryAttributes, RequestHistoryCreationAttributes> implements RequestHistoryAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public url!: string;
  public method!: string;
  public params!: Record<string, string>;
  public headers!: Record<string, string>;
  public body?: string;
  public auth?: Record<string, any>;
  public response?: Record<string, any>;
  public status?: number;
  public duration?: number;
  public created_at!: Date;
}

RequestHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'GET',
    },
    params: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    headers: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    auth: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RequestHistory',
    tableName: 'request_history',
    timestamps: false,
  }
);

// Favorite接口
export interface FavoriteAttributes {
  id: string;
  user_id: string;
  name: string;
  url: string;
  method: string;
  params: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  auth?: Record<string, any>;
  folder?: string;
  created_at: Date;
  updated_at: Date;
}

interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'id' | 'params' | 'headers' | 'body' | 'auth' | 'folder' | 'created_at' | 'updated_at'> {}

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public url!: string;
  public method!: string;
  public params!: Record<string, string>;
  public headers!: Record<string, string>;
  public body?: string;
  public auth?: Record<string, any>;
  public folder?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'GET',
    },
    params: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    headers: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    auth: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    folder: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// 定义关系
User.hasMany(Environment, { foreignKey: 'user_id', as: 'environments' });
Environment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(RequestHistory, { foreignKey: 'user_id', as: 'requestHistory' });
RequestHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export { sequelize };
