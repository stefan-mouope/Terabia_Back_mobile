const User = require('../models/User');

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only view their own profile or if they are admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only view your own profile.' });
    }

    const user = await User.findById(parseInt(id));

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Exclude sensitive information like password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, city, gender, cni } = req.body;

    // Ensure user can only update their own profile or if they are admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }

    const user = await User.findById(parseInt(id));

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update user properties (only allow specific fields to be updated)
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (gender) user.gender = gender;
    if (cni) user.cni = cni; // Conditional update for CNI
    user.updatedAt = new Date().toISOString();

    // In a real application, you would save the updated user to the database
    // For this in-memory model, we're modifying the existing object

    const { password, ...updatedUserWithoutPassword } = user;
    res.status(200).json({ message: 'User updated successfully', user: updatedUserWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
