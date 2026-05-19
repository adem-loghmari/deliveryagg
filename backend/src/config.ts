import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtExpiresIn: '7d',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@deliveryagg.tn',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Admin@123456',
  marketDeliveryRate: parseFloat(process.env.MARKET_DELIVERY_RATE ?? '8'),
  marketCancellationRate: parseFloat(process.env.MARKET_CANCELLATION_RATE ?? '6'),
  platformDeliveryCost: parseFloat(process.env.PLATFORM_DELIVERY_COST ?? '6'),
  platformCancellationCost: parseFloat(process.env.PLATFORM_CANCELLATION_COST ?? '0'),
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@deliveryagg.tn',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
}
