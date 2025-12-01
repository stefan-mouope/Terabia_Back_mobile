require("dotenv").config();
const {
  sequelize,
  User,
  Category,
  Product,
  Order,
  Delivery,
  Transaction,
  Review,
  AuthUser,
} = require("./models");

const bcrypt = require("bcryptjs");
const {
  USER_ROLE,
  ORDER_STATUS,
  PAYMENT_STATUS,
  DELIVERY_STATUS,
  REVIEW_TYPE,
} = require("./constants/enums");

const { v4: uuidv4 } = require("uuid");

const seedDatabase = async () => {
  try {
    console.log("🔄 Syncing database...");
    await sequelize.sync(); // ← plus de force: true
    console.log("✅ Database synced!");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // --------------------- USERS ---------------------
    const [adminAuth] = await AuthUser.findOrCreate({
      where: { email: "admin@example.com" },
      defaults: { id: uuidv4(), encrypted_password: hashedPassword },
    });
    await User.findOrCreate({
      where: { id: adminAuth.id },
      defaults: { role: USER_ROLE.ADMIN, name: "Admin User", phone: "111-222-3333", city: "Admin City" },
    });

    const [sellerAuth] = await AuthUser.findOrCreate({
      where: { email: "seller@example.com" },
      defaults: { id: uuidv4(), encrypted_password: hashedPassword },
    });
    const [sellerUser] = await User.findOrCreate({
      where: { id: sellerAuth.id },
      defaults: {
        role: USER_ROLE.SELLER,
        name: "Seller One",
        phone: "444-555-6666",
        city: "Seller Town",
        cni: "SELLERCNI123",
        rating: 4.5,
        total_ratings: 10,
      },
    });

    const [buyerAuth] = await AuthUser.findOrCreate({
      where: { email: "buyer@example.com" },
      defaults: { id: uuidv4(), encrypted_password: hashedPassword },
    });
    const [buyerUser] = await User.findOrCreate({
      where: { id: buyerAuth.id },
      defaults: { role: USER_ROLE.BUYER, name: "Buyer One", phone: "777-888-9999", city: "Buyer City" },
    });

    const [deliveryAuth] = await AuthUser.findOrCreate({
      where: { email: "delivery@example.com" },
      defaults: { id: uuidv4(), encrypted_password: hashedPassword },
    });
    const [deliveryUser] = await User.findOrCreate({
      where: { id: deliveryAuth.id },
      defaults: {
        role: USER_ROLE.DELIVERY,
        name: "Delivery Guy",
        phone: "000-111-2222",
        city: "Delivery City",
        cni: "DELIVERYCNI456",
        rating: 4.8,
        total_ratings: 5,
      },
    });

    console.log("👤 Users seeded!");

    // --------------------- CATEGORIES ---------------------
    const categoriesData = [
      { name: "Vegetables", slug: "vegetables", icon: "🥬", description: "Fresh vegetables and greens" },
      { name: "Fruits", slug: "fruits", icon: "🍎", description: "Seasonal fruits" },
      { name: "Grains & Cereals", slug: "grains-cereals", icon: "🌾", description: "Rice, corn, wheat, and more" },
    ];

    const createdCategories = [];
    for (const c of categoriesData) {
      const [category] = await Category.findOrCreate({ where: { slug: c.slug }, defaults: c });
      createdCategories.push(category);
    }

    const vegetablesCategory = createdCategories[0];
    const fruitsCategory = createdCategories[1];

    console.log("📂 Categories seeded!");

    // --------------------- PRODUCTS ---------------------
    await Product.findOrCreate({
      where: { title: "Organic Tomatoes" },
      defaults: {
        seller_id: sellerUser.id,
        category_id: vegetablesCategory.id,
        description: "Freshly picked organic tomatoes from our farm.",
        price: 5.5,
        stock: 100,
        unit: "kg",
        currency: "XAF",
        images: ["https://example.com/tomato1.jpg", "https://example.com/tomato2.jpg"],
        location_city: sellerUser.city,
      },
    });

    await Product.findOrCreate({
      where: { title: "Sweet Apples" },
      defaults: {
        seller_id: sellerUser.id,
        category_id: fruitsCategory.id,
        description: "Crispy and sweet red apples.",
        price: 3.2,
        stock: 200,
        unit: "kg",
        currency: "XAF",
        images: ["https://example.com/apple1.jpg"],
        location_city: sellerUser.city,
      },
    });

    console.log("🛒 Products seeded!");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
