const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product'); // Adjust path to your Product model
dotenv.config();
// Your product data from productData.js
const productData = {
  // Desktop items collection
  desktop: [
    {
      id: "desk-001",
      name: "Blue Lock Mouse Pad",
      subtitle: "Sports Anime Collection",
      price: 400.00,
      image: "assets/desktop/mousepad1.jpg",
      description: "Extended mouse pad featuring Nagi from Blue Lock.",
      category: "desktop",
      subcategory: "mousepad",
      inStock: true,
      rating: 4.5
    },
    {
      id: "desk-002",
      name: "My Hero Academia Mouse Pad",
      subtitle: "Hero Desk",
      price: 350.00,
      image: "assets/desktop/mousepad2.jpg",
      description: "LED desk lamp with My Hero Academia theme. Three brightness settings and USB port.",
      category: "desktop",
      subcategory: "mousepad",
      inStock: true,
      rating: 4.6
    },
    {
      id: "desk-003",
      name: "Anime Themed Mouse Pad",
      subtitle: "Otaku Essentials",
      price: 300.00,
      image: "/assets/desktop/mousepad3.jpg",
      description: "RGB mechanical keyboard with anime-themed keycaps. Blue switches for tactile feedback.",
      category: "desktop",
      subcategory: "mousepad",
      inStock: true,
      rating: 4.8
    }
  ],

// Figurines collection
figurines: [
  {
    id: "fig-001",
    name: "Roronoa Zoro Figurine",
    subtitle: "One Piece",
    price: 150.00,
    image: "/assets/figurines/figure1.jpg",
    description: "Detailed Roronoa Zoro action figure in combat pose. Highly articulated with multiple accessories.",
    category: "figurines",
    subcategory: "figures",
    inStock: true,
    rating: 4.7
  },
  {
    id: "fig-002",
    name: "Uraraka Floating Figurine",
    subtitle: "My Hero Academia",
    price: 250.00,
    image: "/assets/figurines/figure2.jpg",
    description: "Premium Dragon Ball Z collectible statue featuring Goku in Super Saiyan form.",
    category: "figurines",
    subcategory: "figures",
    inStock: true,
    rating: 4.9
  },
  {
    id: "fig-003",
    name: "Mandate Ackerman Figure",
    subtitle: "Attack on Titan",
    price: 450.00,
    image: "/assets/figurines/figure3.jpg",
    description: "Attack on Titan's Mikasa Ackerman in 3D maneuver gear. Detailed paintwork and sculpting.",
    category: "figurines",
    subcategory: "figures",
    inStock: true,
    rating: 4.5
  }
],

 // Plushies collection
 plushies: [
  {
    id: "plush-001",
    name: "Totoro Plush",
    subtitle: "Ghibli Collection",
    price: 250.00,
    image: "/assets/plushies/plush1.jpg",
    description: "Soft and huggable Totoro plush toy from Studio Ghibli's My Neighbor Totoro.",
    category: "plushies",
    subcategory: "character",
    inStock: true,
    rating: 4.9
  },
  {
    id: "plush-002",
    name: "Gojo Plushie",
    subtitle: "Jujutsu Kaisen",
    price: 350.00,
    image: "/assets/plushies/plush2.jpg",
    description: "Official Pokémon Pikachu plush toy. Super soft material, perfect for Pokémon fans.",
    category: "plushies",
    subcategory: "character",
    inStock: true,
    rating: 4.8
  },
  {
    id: "plush-003",
    name: "Kiki's Black Cat Jiji",
    subtitle: "Ghibli Collection",
    price: 400.00,
    image: "/assets/plushies/plush3.jpg",
    description: "Adorable Jiji plush from Kiki's Delivery Service. Made with premium materials.",
    category: "plushies",
    subcategory: "character",
    inStock: true,
    rating: 4.7
  }
],

// Clothing collection
clothing: [
  {
    id: "cloth-001",
    name: "My Hero Academia T-Shirt",
    subtitle: "Plus Ultra Apparel",
    price: 200.00,
    image: "/assets/clothing/clothing1.jpg",
    description: "100% cotton t-shirt featuring the Class 1-A heroes. Available in multiple sizes.",
    category: "clothing",
    subcategory: "t-shirts",
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.6
  },
  {
    id: "cloth-002",
    name: "One Piece Straw Hat Hoodie",
    subtitle: "Grand Line Collection",
    price: 350.00,
    image: "/assets/clothing/clothing2.jpg",
    description: "Comfortable hoodie with Straw Hat Pirates logo. Perfect for anime fans and casual wear.",
    category: "clothing",
    subcategory: "t-shirts",
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8
  },
  {
    id: "cloth-003",
    name: "Demon Slayer Jacket",
    subtitle: "Hashira Designs",
    price: 420.00,
    image: "/assets/clothing/clothing3.jpg",
    description: "Stylish jacket inspired by Demon Slayer Corps uniform. Water-resistant material.",
    category: "clothing",
    subcategory: "t-shirts",
    inStock: true,
    sizes: ["M", "L", "XL"],
    rating: 4.7
  }
]
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Prepare all products in a flat array
    const allProducts = [];
    
    for (const category in productData) {
      productData[category].forEach(product => {
        // Convert the id field to MongoDB's _id if needed
        const { id, ...productWithoutId } = product;
        allProducts.push(productWithoutId);
      });
    }
    
    // Insert all products
    await Product.insertMany(allProducts);
    console.log(`Successfully seeded ${allProducts.length} products`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the function
seedDatabase();
