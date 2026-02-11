const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        // Database connect karein
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Seeding...");

        await Admin.deleteMany({});

        const email = (process.env.ADMIN_EMAIL || 'armanhasan609@gmail.com').trim().toLowerCase();
        const plainPassword = process.env.ADMIN_PASSWORD || 'Arman1290';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newAdmin = new Admin({ email, password: hashedPassword });
        await newAdmin.save();

        console.log("Admin created successfully!");
        console.log(`Email: ${email} | Password: ${plainPassword}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();