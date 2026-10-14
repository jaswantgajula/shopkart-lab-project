import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Customer from '../models/customer.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const email = String(process.argv[2] || '').trim().toLowerCase();
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!email) {
  console.error('Usage: npm run make-admin -- customer@example.com');
  process.exit(1);
}

if (!mongoUri) {
  console.error('MONGO_URI is not configured.');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  const customer = await Customer.findOneAndUpdate(
    { email },
    { $set: { role: 'admin' } },
    { new: true, runValidators: true },
  );

  if (!customer) {
    console.error(`No customer was found for ${email}. Register that account first.`);
    process.exitCode = 1;
  } else {
    console.log(`${email} is now a ShopKart administrator.`);
  }
} catch (error) {
  console.error(`Could not promote customer: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
