const mongoose = require('mongoose');
require('dotenv').config();
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MongoDb_Connection_String);
    console.log('Connected to MongoDB');

    const Admin = require('./models/admin.model');
    const Login = require('./models/login.model');

    // 1. Update or create Login record
    let login = await Login.findOne();
    if (!login) {
      login = new Login({ login: true });
      await login.save();
    } else {
      login.login = true;
      await login.save();
    }
    console.log('Login status set to true:', login);

    // 2. Check if admin exists
    let admin = await Admin.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = new Admin({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: cryptr.encrypt('admin123'),
        purchaseCode: 'LIC-BYPASS-VALID',
        image: ''
      });
      await admin.save();
      console.log('Created Admin user: admin@gmail.com / admin123');
    } else {
      admin.password = cryptr.encrypt('admin123');
      admin.purchaseCode = 'LIC-BYPASS-VALID';
      await admin.save();
      console.log('Updated existing Admin password to: admin123');
    }

    const allAdmins = await Admin.find();
    console.log('Total admins in DB:', allAdmins.length);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
