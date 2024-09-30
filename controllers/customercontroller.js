const db = require('../config/database');


exports.customerpost = async (req, res) => {
    try {
        const { email, dob, address, city, block, pin_code } = req.body;

        // Check if the email exists in the Auth table
        const [authResults] = await db.execute('SELECT Auth_id FROM Auth WHERE Email = ?', [email]);
        if (authResults.length === 0) {
            return res.status(404).json({ message: 'Email not found in Auth table.' });
        }

        const authId = authResults[0].Auth_id;

        // Check if the address already exists
        const [addressResults] = await db.execute(
            'SELECT Address_id FROM Addresses WHERE Address = ? AND City = ? AND Block = ? AND Pin_code = ?',
            [address, city, block, pin_code]
        );

        let addressId;
        if (addressResults.length === 0) {
            // Insert new address if it does not exist
            const [newAddressResults] = await db.execute(
                'INSERT INTO Addresses (Address, City, Block, Pin_code) VALUES (?, ?, ?, ?)',
                [address, city, block, pin_code]
            );
            addressId = newAddressResults.insertId;
        } else {
            addressId = addressResults[0].Address_id;
        }

        // Check if the customer already exists
        const [customerResults] = await db.execute(
            'SELECT Customer_id FROM Customers WHERE Auth_id = ? AND Address_id = ? AND DOB = ?',
            [authId, addressId, dob]
        );

        if (customerResults.length === 0) {
            // Insert new customer if it does not exist
            const [newCustomerResults] = await db.execute(
                'INSERT INTO Customers (DOB, Address_id, Auth_id) VALUES (?, ?, ?)',
                [dob, addressId, authId]
            );
            return res.status(201).json({ message: 'Customer created successfully.', customerId: newCustomerResults.insertId });
        } else {
            return res.status(409).json({ message: 'Customer already exists.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get a customer by ID
exports.customerget =  async (req, res) => {
    try {
        const customerId = req.params.id;

        const [results] = await db.execute(`
            SELECT c.Customer_id, c.DOB, a.Address, a.City, a.Block, a.Pin_code, auth.Email, auth.Name
            FROM Customers c
            JOIN Auth auth ON c.Auth_id = auth.Auth_id
            JOIN Addresses a ON c.Address_id = a.Address_id
            WHERE c.Customer_id = ?
        `, [customerId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        return res.status(200).json(results[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

