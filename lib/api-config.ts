// 定义 API 基础 URL，如果环境变量未设置则使用本地开发服务器地址
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// 定义所有 API 端点
export const API_ENDPOINTS = {
  // 管理员相关接口
  ADMIN_LOGIN: '/api/admin/login',
  
  // 用户管理相关接口
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_CHECK: (idCard: string) => `/api/users/check/${idCard}`,
  
  // 区域管理相关接口
  ZONES: '/api/zones',
  ZONE_BY_ID: (id: string) => `/api/zones/${id}`,
  ZONE_CHECK: (name: string) => `/api/zones/check/${name}`,
  
  // 机器管理相关接口
  MACHINES: '/api/machines',
  MACHINE_BY_ID: (id: string) => `/api/machines/${id}`,
  MACHINE_STATUS: '/api/machines/status',
  
  // 充值相关接口
  RECHARGE: '/api/users/recharge',
  
  // 日志相关接口
  USER_LOGS: '/api/userlogs',
  MANAGEMENT_LOGS: '/api/managementlogs',
  
  // 商品管理相关接口
  COMMODITIES: '/api/commodities',
  
  // 用户登录相关接口
  USER_LOGIN: '/api/users/login',
  
  USERS_START_USING_POST: (userId: number, machineId: number) => `/api/users/${userId}/start/${machineId}`,
  USERS_STOP_USING_POST: (userId: number) => `/api/users/${userId}/stop`,
  
  // 添加订单相关端点
  ORDERS: '/api/orders',
  ORDERS_SEARCH: '/api/orders/search',
  ORDER_STATUS: (id: number) => `/api/orders/${id}/status`,
} 