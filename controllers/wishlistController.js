const Wishlist = require('../models/wishlist');

exports.addWishlistItem = async (req, res) => {
    try {
        const { user_id, product_id, variant_id } = req.body;   
        if (!user_id || !product_id || !variant_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        let wishlistItem = await Wishlist.findOne({ user_id, product_id });
        if (wishlistItem) {
            return res.status(200).json({ message: "Item already in wishlist", wishlistItem });
        } else {
            const newWishlistItem = new Wishlist({
                user_id,
                product_id,
                variant_id,
            });
            await newWishlistItem.save();
            return res.status(201).json(newWishlistItem);
        }
    } catch (error) {
        console.error("Error adding wishlist item", error);
        res.status(500).json({ message: "Error adding wishlist item", error });
    }
};

exports.deleteWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlistItem = await Wishlist.findOneAndDelete({ product_id: productId });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Wishlist item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting wishlist item', error });
  }
};


exports.getWishlistItems = async (req, res) => {
    try {
        const wishlistItems = await Wishlist.find()
            .populate('product_id');
            res.status(200).json(wishlistItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist items', error });
    }
};
