import express, { Request, Response, NextFunction } from 'express';
import { prisma } from "./lib/prisma";
import userRoutes from './routes/userRoute';
import storeRoute from "./routes/storeRoute";
import productRoute from "./routes/productRoute";
import inventoryRoute from "./routes/inventoryRoute";
import customerRoute from './routes/CustomerRoute';
import marketing from './routes/marketing';
import orderRoutes from './routes/orderController';
import teamRoute from './routes/teamRoute';
import dotenv from 'dotenv';
dotenv.config();

// Connect and verify database

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json()); 
app.use((err: any, req: Request, res: Response, next: NextFunction): any => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      console.error(`Bad JSON Request: ${err.message}`);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid JSON format. Please verify your request payload syntax.'
      });
    }
    next(err);
  });
  
  app.use('/api/user', userRoutes);
  app.use('/api/store', storeRoute);
  app.use('/api/product', productRoute);
  app.use('/api/inventory', inventoryRoute);
  app.use('/api/customer', customerRoute);
  app.use('/api/campaign', marketing);
  app.use('/api/orders', orderRoutes);
  app.use('/api/team', teamRoute);

  async function start(){
  try{
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on('close', () => {
      console.log('HTTP server has closed');
    });

    server.on('error', (err) => {
      console.error('HTTP server error:', err);
    });

  }catch(error){
    console.error('Error starting the server:', error);
    process.exit(1);
  }
 }

 process.on('unhandledRejection', (reason, promise) => {
   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
 });

 process.on('uncaughtException', (err) => {
   console.error('Uncaught Exception:', err);
 });

 if (process.env.VERCEL !== '1') {
   start();
 }

 export default app;