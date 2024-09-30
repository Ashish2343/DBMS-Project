const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO Auth (Email, Name, Password) VALUES (?, ?, ?)',
            [email, name, hashedPassword]
        );
        res.status(201).json({ id: result.insertId, email, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user details from the Auth table
        const [rows] = await db.execute('SELECT * FROM Auth WHERE Email = ?', [email]);

        // Check if user exists
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.Password);
        if (!match) {
            return res.status(401).json({message: 'Invalid password' });
        }

        // Retrieve the associated Customer_id from the Customers table
        const [customerRows] = await db.execute('SELECT Customer_id FROM Customers WHERE Auth_id = ?', [user.Auth_id]);
        
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const customer = customerRows[0];
        console.log(customer);
        
        // Generate JWT with Customer_id
        const token = jwt.sign({ userId: customer.Customer_id },'kjfoh349isb2f9b2if', { expiresIn: '1h' });
        // Respond with the token and a success message
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
};