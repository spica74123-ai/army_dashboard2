import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ connected to MongoDB");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;

  // Initialize Models if not already defined (Next.js HMR protection)
  await initModels();

  return cached.conn;
}

async function initModels() {
  if (mongoose.models.Unit) return;

  const UnitSchema = new mongoose.Schema({
    plan: String, l0: String, l1: String, l2: String, l3: String, l4: String,
    g: { type: Number, default: 0 }, n: { type: Number, default: 0 },
    s: { type: Number, default: 0 }, p: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 },
    checkList: String, statusNote: String,
    prevG: { type: Number, default: 0 }, prevN: { type: Number, default: 0 },
    prevS: { type: Number, default: 0 }, prevP: { type: Number, default: 0 },
    prevTotal: { type: Number, default: 0 }
  }, { timestamps: true });

  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, default: 'Viewer' }
  });

  UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  });

  UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
      return false;
    }
  };

  const PersonnelSchema = new mongoose.Schema({
    rank: String, name: String, position_normal: String, position_field: String,
    id_card: String, mil_id: String, unit: String, affiliation: String, line_id: String,
  }, { timestamps: true });

  const LogSchema = new mongoose.Schema({
    name: String, role: String, action: String
  }, { timestamps: true });

  const CasualtySchema = new mongoose.Schema({
    date: String, name: String, unit: String, cause: String,
    status: String, picUrl: String, doctorConfirm: String
  }, { timestamps: true });

  mongoose.model('Unit', UnitSchema);
  mongoose.model('User', UserSchema);
  mongoose.model('Personnel', PersonnelSchema);
  mongoose.model('Log', LogSchema);
  mongoose.model('Casualty', CasualtySchema);

  // Initialize Default Admin
  try {
    const User = mongoose.model('User');
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      await User.create({ username: 'admin', password: '123', name: 'System Admin', role: 'Admin' });
      console.log("✅ Default admin user created (admin/123)");
    }
  } catch (error) {
    console.error("❌ Failed to initialize default user:", error);
  }
}

export default connectDB;
