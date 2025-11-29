let users = []; // In-memory "database"
let nextUserId = 1;

class User {
  constructor(role, name, email, phone, password, city, gender, cni) {
    this.id = nextUserId++;
    this.role = role;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.city = city;
    this.gender = gender;
    this.cni = cni;
    this.createdAt = new Date().toISOString();
  }

  static async create({ role, name, email, phone, password, city, gender, cni }) {
    const newUser = new User(role, name, email, phone, password, city, gender, cni);
    users.push(newUser);
    return newUser;
  }

  static async findByEmailOrPhone(email, phone) {
    return users.find(user => user.email === email || user.phone === phone);
  }

  static async findById(id) {
    return users.find(user => user.id === id);
  }
}

module.exports = User;
