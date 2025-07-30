#!/usr/bin/env tsx
import { testConnection, syncDatabase } from '../config/database';

const syncDB = async () => {
  try {
    console.log('🔧 Starting database synchronization...');
    
    await testConnection();
    console.log('✅ Database connection successful');
    
    await syncDatabase(true); // force: true 会重新创建表
    console.log('✅ Database synchronized successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    process.exit(1);
  }
};

syncDB();
