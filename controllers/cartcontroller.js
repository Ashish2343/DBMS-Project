const db = require('../config/database');

exports.getCartItems = async(req,res)=>{
    try{
        const customerId = req.userId;
        console.log(customerId);
        if(!customerId)return res.status(404).message('user not found');
        const [cartItems] = await db.execute(`
            SELECT i.Item_id, i.Description, i.Category, c.Quantity
            FROM Cart c
            JOIN Items i ON c.Item_id = i.Item_id
            WHERE c.Customer_id = ?`,[customerId])
        if(cartItems.length==0){
            return res.status(404).json({message: 'Cart is Empty!'});
        }
        return res.status(200).json({cartItems});
    }
    catch(error){
        res.send(error.message)
    }

};

exports.addItemToCart = async (req, res) => {
    try {
        const customerId = req.userId;
        const { itemId, quantity } = req.body;

        if (!customerId) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!itemId || !quantity) {
            return res.status(400).json({ message: 'Item ID and quantity are required' });
        }

        // Check if the item already exists in the cart for this customer
        const [existingCartItem] = await db.execute(`
            SELECT * FROM Cart WHERE Customer_id = ? AND Item_id = ?
        `, [customerId, itemId]);

        if (existingCartItem.length > 0) {
            // Update the quantity of the existing item in the cart
            await db.execute(`
                UPDATE Cart SET Quantity = Quantity + ? WHERE Customer_id = ? AND Item_id = ?
            `, [quantity, customerId, itemId]);
        } else {
            // Insert the new item into the cart
            await db.execute(`
                INSERT INTO Cart (Customer_id, Item_id, Quantity) VALUES (?, ?, ?)
            `, [customerId, itemId, quantity]);
        }

        return res.status(201).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};