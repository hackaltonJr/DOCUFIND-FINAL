require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/docufind_test';

beforeAll(async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
