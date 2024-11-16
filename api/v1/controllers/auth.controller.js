const User = require("../../../models/user.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

module.exports.login =  async (req, res) => {
  try {
    const { email, password } = req.body;

     const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
    expiresIn: '1h',
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}


//profile
module.exports.getProfile = async (req, res) => {
  try {
    // Lấy userId từ token
    const token = req.headers.authorization.split(' ')[1]; //Bearer <token>
    const decoded = jwt.verify(token, 'your-secret-key');
    const userId = decoded.userId;

    
    const user = await User.findById(userId).select('-password'); // Không trả mật khẩu

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};


module.exports.updateProfile = async (req, res) => {
  try {
    const { username, email, password, newPassword } = req.body;

    // Lấy userId từ token
    const token = req.headers.authorization.split(' ')[1]; // Giả sử token là Bearer <token>
    const decoded = jwt.verify(token, 'your-secret-key');
    const userId = decoded.userId;

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cập nhật thông tin người dùng
    if (username) user.username = username;
    if (email) user.email = email;

    // Nếu người dùng muốn thay đổi mật khẩu
    if (password && newPassword) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
