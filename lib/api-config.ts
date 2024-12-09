export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  // 管理员接口
  ADMIN_LOGIN: '/api/admin/login',
  
  // 用户管理接口
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_CHECK: (idCard: string) => `/api/users/check/${idCard}`,
  
  // 区域管理接口
  ZONES: '/api/zones',
  ZONE_BY_ID: (id: string) => `/api/zones/${id}`,
  ZONE_CHECK: (name: string) => `/api/zones/check/${name}`,
  
  // 机器管理接口
  MACHINES: '/api/machines',
  MACHINE_BY_ID: (id: string) => `/api/machines/${id}`,
  MACHINE_STATUS: '/api/machines/status',
  
  // 充值接口
  RECHARGE: '/api/users/recharge',
  
  // 日志接口
  USER_LOGS: '/api/logs/user',
  MANAGEMENT_LOGS: '/api/logs/management'
} 