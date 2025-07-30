export interface DemoUser {
  username: string;
  password: string;
  email: string;
  avatar: string;
}

export interface DemoPhone {
  phone: string;
  code: string;
}

export const demoUsers: DemoUser[] = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@xhtech.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    username: 'developer',
    password: 'dev123',
    email: 'dev@xhtech.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer'
  },
  {
    username: 'tester',
    password: 'test123',
    email: 'test@xhtech.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tester'
  }
];

export const demoPhones: DemoPhone[] = [
  { phone: '13800138000', code: '123456' },
  { phone: '13800138001', code: '123456' },
  { phone: '13800138002', code: '123456' }
];

export const validateUserLogin = (username: string, password: string): DemoUser | null => {
  return demoUsers.find(user => user.username === username && user.password === password) || null;
};

export const validatePhoneLogin = (phone: string, code: string): DemoPhone | null => {
  return demoPhones.find(p => p.phone === phone && p.code === code) || null;
};
