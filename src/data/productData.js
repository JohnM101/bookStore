// src/data/productData.js

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
    inStock: true,
    sizes: ["M", "L", "XL"],
    rating: 4.7
  }
],

// Varieties/miscellaneous items
varieties: [
  {
    id: "var-001",
    name: "Anime Wall Scroll Collection",
    subtitle: "Room Decor Plus",
    price: 270.00,
    image: "/assets/poster1.jpg",
    description: "High-quality fabric wall scrolls featuring various popular anime series.",
    category: "varieties",
    inStock: true,
    rating: 4.4
  },
  {
    id: "var-002",
    name: "Anime Character Pin Pack",
    subtitle: "Collector's Choice",
    price: 30.00,
    image: "/assets/pin1.jpg",
    description: "Pack of 50 waterproof vinyl pins featuring popular anime characters.",
    category: "varieties",
    inStock: true,
    rating: 4.7
  },
  {
    id: "var-003",
    name: "Anime Series Poster Set",
    subtitle: "Fandom Art",
    price: 150.00,
    image: "/assets/poster3.jpg",
    description: "Set of 5 high-quality posters from top anime series. Perfect for room decoration.",
    category: "varieties",
    inStock: true,
    rating: 4.5
  }
]
};

// Helper function to find a product by ID across all categories
export const getProductById = (productId) => {
for (const category in productData) {
  const foundProduct = productData[category].find(product => product.id === productId);
  if (foundProduct) return foundProduct;
}
return null; // Return null if product not found
};

// Export the entire data object
export default productData;
