const db = require('../config/database');

exports.createOrder = async (req, res) => {
    try {
        const { totalPrice, description, quantity, items } = req.body;

        // Validate input
        if (totalPrice === undefined || description === undefined || quantity === undefined || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Start a transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        console.log(req.userId)
        try {
            // Check if req.userId is defined
            if (!req.userId) {
                throw new Error("User ID is not defined");
            }

            // Insert into Orders table
            const [orderResult] = await connection.execute(
                'INSERT INTO Orders (Customer_id, Total_Price, Description, Quantity) VALUES (?, ?, ?, ?)',
                [req.userId, totalPrice, description, quantity]
            );
            const orderId = orderResult.insertId;

            // Insert into OrderItems table
            for (const item of items) {
                const { itemId, itemQuantity } = item;
                if (itemId === undefined || itemQuantity === undefined) {
                    throw new Error("Missing item details");
                }
                await connection.execute(
                    'INSERT INTO OrderItems (Order_id, Item_id, Quantity) VALUES (?, ?, ?)',
                    [orderId, itemId, itemQuantity]
                );
            }

            // Commit the transaction
            await connection.commit();
            res.status(201).json({ orderId, totalPrice, description, quantity, items });
        } catch (error) {
            // Rollback the transaction in case of error
            await connection.rollback();
            throw error;
        } finally {
            // Release the connection
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
