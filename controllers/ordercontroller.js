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
            throw error.message('Problem with transaction');
        } finally {
            // Release the connection
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message }.message('some Problem'));
    }
};

exports.getOrder = async (req, res) => {
    try {
        const customerId = req.userId;

        if (!customerId) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch orders and their items for the customer
        const [orders] = await db.execute(`
            SELECT o.Order_id, o.Total_Price, o.Description, o.Quantity as Order_Quantity, 
            i.Item_id, i.Description as Item_Description, i.Category, oi.Quantity as Item_Quantity
            FROM Orders o
            JOIN OrderItems oi ON o.Order_id = oi.Order_id
            JOIN Items i ON oi.Item_id = i.Item_id
            WHERE o.Customer_id = ?
        `, [customerId]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        // Group items by order
        const result = {};
        orders.forEach(order => {
            const { Order_id, Total_Price, Description, Order_Quantity, Item_id, Item_Description, Category, Item_Quantity } = order;

            if (!result[Order_id]) {
                result[Order_id] = {
                    Order_id,
                    Total_Price,
                    Description,
                    Order_Quantity,
                    items: []
                };
            }

            result[Order_id].items.push({
                Item_id,
                Item_Description,
                Category,
                Item_Quantity
            });
        });

        return res.status(200).json({ orders: Object.values(result) });
    } catch (error) {
        return res.status(500).json({ error: error.message.json('problem') });
    }
};


exports.cancelOrder = async (req, res) => {
    try {
        const customerId = req.userId;
        const { orderId } = req.body;

        if (!customerId) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Check if the order exists for this customer
        const [existingOrder] = await db.execute(`
            SELECT * FROM Orders WHERE Customer_id = ? AND Order_id = ?
        `, [customerId, orderId]);

        if (existingOrder.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Remove the items associated with the order from OrderItems
        await db.execute(`
            DELETE FROM OrderItems WHERE Order_id = ?
        `, [orderId]);

        // Remove the order from Orders
        await db.execute(`
            DELETE FROM Orders WHERE Order_id = ? AND Customer_id = ?
        `, [orderId, customerId]);

        return res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


