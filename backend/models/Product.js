let products = []; // In-memory "database"
let nextProductId = 1;

class Product {
  constructor(sellerId, title, description, price, currency, stock, categoryId, images, location) {
    this.id = nextProductId++;
    this.sellerId = sellerId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.currency = currency || "XAF";
    this.stock = stock;
    this.categoryId = categoryId;
    this.images = images;
    this.location = location;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async create({ sellerId, title, description, price, currency, stock, categoryId, images, location }) {
    const newProduct = new Product(sellerId, title, description, price, currency, stock, categoryId, images, location);
    products.push(newProduct);
    return newProduct;
  }

  static async find() {
    return products;
  }

  static async findById(id) {
    return products.find(product => product.id === id);
  }

  static async update(id, updates) {
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) return null;

    products[productIndex] = { ...products[productIndex], ...updates, updatedAt: new Date().toISOString() };
    return products[productIndex];
  }

  static async delete(id) {
    const initialLength = products.length;
    products = products.filter(product => product.id !== id);
    return products.length < initialLength;
  }

  // Basic filtering for demonstration
  static async filter({ category, price, city, q }) {
    let filteredProducts = [...products];

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === parseInt(category));
    }
    if (price) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(price));
    }
    if (city) {
      filteredProducts = filteredProducts.filter(p => p.location.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (q) {
      const query = q.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return filteredProducts;
  }
}

module.exports = Product;
