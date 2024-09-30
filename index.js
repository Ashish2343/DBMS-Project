const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const customers = require('./routes/customer');
// const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api', customers);
app.use('/api', orderRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
