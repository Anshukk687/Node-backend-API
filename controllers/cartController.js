const CartItem = require('../models/cart');

exports.addCartItem = async (req, res) => {
    try {
        const { user_id, product_id, variant_id, quantity } = req.body;

        if (!user_id || !product_id || !variant_id ||!quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let cartItem = await CartItem.findOne({ user_id, product_id });

        if (cartItem) {
            cartItem.quantity = Number(cartItem.quantity) + Number(quantity);
            await cartItem.save();
            return res.status(200).json(cartItem);
        } else {
            const newCart = new CartItem({
                user_id,
                product_id,
                variant_id,
                quantity,
            });
            await newCart.save();
            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error("Error adding cart item", error);
        res.status(500).json({ message: "Error adding cart item", error });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const cartItem = await CartItem.findByIdAndDelete(id);
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
        res.status(200).json({ message: 'Cart item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting cart item', error });
    }
};

exports.getCartItems = async (req, res) => {
    try {
        const cartItems = await CartItem.find()
            .populate('product_id');
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart items', error });
    }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (quantity !== undefined && (isNaN(quantity) || quantity < 1)) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const cartItem = await CartItem.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity !== undefined) {
      cartItem.quantity = quantity;
    }

    await cartItem.save();
    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};


