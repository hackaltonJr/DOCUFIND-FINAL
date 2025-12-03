// USE THIS ONLY ONCE. I REPEAT DO NOT RUN THIS WITHOUT MY PERMISSION. THE DATABASE IS NOT YOURS. BY HACKALTON

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function connect() {
  // first start with existing connectDB helper if available
  try {
    const connectDB = require(path.resolve(__dirname, "..", "config", "db"));
    if (typeof connectDB === "function") {
      await connectDB();
      return;
    }
  } catch (e) {
    // fallback to mongoose.connect. I'm not responsible for any data loss.
  }

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/DocuFind";
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

function getUserModel() {
  try {
    const User = require(path.resolve(__dirname, "..", "models", "User"));
    if (User && User.prototype && User.prototype.save) {
      return User;
    }

    try {
      return mongoose.model("User");
    } catch (err) {
      // fall through
    }
  } catch (err) {
    // model file not found or broken, will define below later after this week
  }

  // define fallback schema
  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },
      password: { type: String, required: true },
      role: {
        type: String,
        required: true,
        enum: ["reporter", "finder", "rc_staff", "police", "admin"],
      },
      avatarUrl: { type: String, default: null },
    },
    { timestamps: true }
  );

  try {
    return mongoose.model("User", userSchema);
  } catch (err) {
    // if model already registered
    return mongoose.model("User");
  }
}

async function seed() {
  await connect();
  const User = getUserModel();

  const passwordPlain = "Password123!";
  const hashed = await bcrypt.hash(passwordPlain, 10);

  const rolesDistribution = [
    ...Array(8).fill("reporter"),
    ...Array(6).fill("finder"),
    ...Array(3).fill("rc_staff"),
    ...Array(2).fill("police"),
    "admin",
  ]; // total 20

  const names = [
    "Aisha Bello",
    "Kwame Mensah",
    "Fatima Ahmed",
    "John Doe",
    "Mary Johnson",
    "Carlos Silva",
    "Lina Zhang",
    "Satoshi Nakamoto",
    "Olivia Brown",
    "Noah Wilson",
    "Emma Davis",
    "Liam Martinez",
    "Sophia Anderson",
    "Mason Thomas",
    "Isabella Jackson",
    "Lucas White",
    "Mia Harris",
    "Ethan Clark",
    "Amira Khan",
    "Daniel Lewis",
  ];

  const users = names.map((name, idx) => {
    const role = rolesDistribution[idx];
    const emailLocal = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
    return {
      name,
      email: `${emailLocal}@seed.docufind.test`,
      password: hashed,
      role,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  try {
    console.log("Clearing existing users collection (if any)...");
    await User.deleteMany({});
    console.log("Inserting seeded users...");
    const inserted = await User.insertMany(users, { ordered: false });
    console.log(
      `Inserted ${inserted.length} users. Example credentials: email=user.name@seed.docufind.test / Password: ${passwordPlain}`
    );
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Done.");
  }
}

seed().catch((err) => {
  console.error("Fatal error while seeding users:", err);
  process.exit(1);
});
