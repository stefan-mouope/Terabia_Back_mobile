require("dotenv").config();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api";

const hashedPassword = async (password) => {
  // On hash le mot de passe côté client si nécessaire
  return await bcrypt.hash(password, 10);
};

const seedApi = async () => {
  try {
    console.log("🔄 Seeding database via API...");

    // --------------------- USERS ---------------------
    const users = [
      { email: "admin@example.com", role: "ADMIN", name: "Admin User", phone: "111-222-3333", city: "Admin City" },
      { email: "seller@example.com", role: "SELLER", name: "Seller One", phone: "444-555-6666", city: "Seller Town" },
      { email: "buyer@example.com", role: "BUYER", name: "Buyer One", phone: "777-888-9999", city: "Buyer City" },
      { email: "delivery@example.com", role: "DELIVERY", name: "Delivery Guy", phone: "000-111-2222", city: "Delivery City" },
    ];

    for (const u of users) {
      // Crée AuthUser + User via endpoint register
      const payload = {
        email: u.email,
        password: "password123",
        name: u.name,
        phone: u.phone,
        city: u.city,
        role: u.role,
      };
      try {
        await axios.post(`${API_BASE}/auth/register`, payload);
        console.log(`✅ User created: ${u.email}`);
      } catch (err) {
        if (err.response && err.response.status === 409) {
          console.log(`⚠️ User already exists: ${u.email}`);
        } else {
          console.error(`❌ Error creating user ${u.email}:`, err.message);
        }
      }
    }

    // --------------------- CATEGORIES ---------------------
    const categories = [
      { name: "Vegetables", slug: "vegetables", icon: "🥬", description: "Fresh vegetables and greens" },
      { name: "Fruits", slug: "fruits", icon: "🍎", description: "Seasonal fruits" },
      { name: "Grains & Cereals", slug: "grains-cereals", icon: "🌾", description: "Rice, corn, wheat, and more" },
    ];

    for (const c of categories) {
      try {
        await axios.post(`${API_BASE}/categories`, c);
        console.log(`✅ Category created: ${c.name}`);
      } catch (err) {
        if (err.response && err.response.status === 409) {
          console.log(`⚠️ Category already exists: ${c.name}`);
        } else {
          console.error(`❌ Error creating category ${c.name}:`, err.message);
        }
      }
    }

    // --------------------- PRODUCTS ---------------------
    // Exemple : il faut d'abord récupérer l'id du seller et des catégories
    const seller = (await axios.get(`${API_BASE}/users?role=SELLER`)).data[0];
    const vegCategory = (await axios.get(`${API_BASE}/categories?slug=vegetables`)).data[0];
    const fruitCategory = (await axios.get(`${API_BASE}/categories?slug=fruits`)).data[0];

    const products = [
      {
        seller_id: seller.id,
        category_id: vegCategory.id,
        title: "Organic Tomatoes",
        description: "Freshly picked organic tomatoes from our farm.",
        price: 5.5,
        stock: 100,
        unit: "kg",
        currency: "XAF",
        images: ["https://example.com/tomato1.jpg", "https://example.com/tomato2.jpg"],
        location_city: seller.city,
      },
      {
        seller_id: seller.id,
        category_id: fruitCategory.id,
        title: "Sweet Apples",
        description: "Crispy and sweet red apples.",
        price: 3.2,
        stock: 200,
        unit: "kg",
        currency: "XAF",
        images: ["https://example.com/apple1.jpg"],
        location_city: seller.city,
      },
    ];

    for (const p of products) {
      try {
        await axios.post(`${API_BASE}/products`, p);
        console.log(`✅ Product created: ${p.title}`);
      } catch (err) {
        if (err.response && err.response.status === 409) {
          console.log(`⚠️ Product already exists: ${p.title}`);
        } else {
          console.error(`❌ Error creating product ${p.title}:`, err.message);
        }
      }
    }

    console.log("🎉 Seeding via API completed!");
  } catch (error) {
    console.error("❌ Seed API error:", error.message);
  }
};

seedApi();
