const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
dotenv.config();

const productData = require('./productData'); // Import your productData if separate

const generateSlug = (name, volumeNumber) => {
  if (!name) return '';
  let base = name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  if (volumeNumber) base += `-vol-${volumeNumber}`;
  return base;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const allProducts = [];

    for (const category in productData) {
      productData[category].forEach(product => {
        const { id, ...rest } = product;
        allProducts.push({
          ...rest,
          slug: generateSlug(rest.name, rest.volumeNumber)
        });
      });
    }

    await Product.insertMany(allProducts);
    console.log(`Successfully seeded ${allProducts.length} products`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
