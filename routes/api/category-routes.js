const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// The `/api/categories` endpoint
 
// ---------------------------------------------------------------------
// ------------------------ GET ALL CATEGORIES -------------------------
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product,
        attributes: ['product_id', 'product_name'],
      }],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    console.log(err); // Print the error for debugging purposes
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// ---------------------------------------------------------------------
// ------------------------ GET CATEGORY BY ID -------------------------
// ---------------------------------------------------------------------
router.get('/:category_id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.category_id, {
      include: [{ model: Product }],
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ CREATE CATEGORY ----------------------------
// ---------------------------------------------------------------------
router.post('/', async (req, res) => {
  // create a new category
  try {
    const categoryData = await Category.create(req.body);

    if (req.body.productIds && req.body.productIds.length > 0) {
      // Find the products by their IDs
      const products = await Product.findAll({
        where: {
          product_id: req.body.productIds,
        },
      });

      // Add the found products to the category
      await categoryData.addProducts(products);
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});


// ---------------------------------------------------------------------
// ------------------------ UPDATE CATEGORY ----------------------------
// ---------------------------------------------------------------------
router.put('/:category_id', async (req, res) => {
  // update a category by its `id` value
  try {
    const categoryData = await Category.findByPk(req.params.category_id);

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    await categoryData.update(req.body);  //Update the category's name

    // Update the associated products 
    if (req.body.productIds && Array.isArray(req.body.productIds)) {
      await categoryData.setProducts(req.body.productIds);
    }

    // Link the updated category with the associated products
    const updatedCategory = await Category.findByPk(req.params.category_id, {
      include: [{ model: Product }],
    });

    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

// ---------------------------------------------------------------------
// ----------------- DELETE CATEGORY BUT KEEP PRODUCTS -----------------
// ---------------------------------------------------------------------
router.delete('/:category_id', async (req, res) => {
  // delete a category by its `id` value
    try {
      const updatedProducts = await Product.update(
        { category_id: null },
        { where: { category_id: req.params.category_id } }
      );

      if (!updatedProducts) {
        res.status(404).json({ message: 'No category with this id!' });
        return;
      }

    // Delete the category
    const deletedCategory = await Category.destroy({
      where: { category_id: req.params.category_id },
    });

    if (!deletedCategory) {
      res.status(404).json({ message: 'No category with this id!' });
      return;
    }

  res.status(200).json({ message: 'Category deleted.' });

  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ---------------------------------------------------------------------
// ----------------- DELETE CATEGORY && ASSOCIATED PRODUCTS ------------
// ---------------------------------------------------------------------
router.delete('/delete/:category_id', async (req, res) => {
  try {
    // Delete the associated products
    await Product.destroy({
      where: { category_id: req.params.category_id }
    });

    // Delete the category
    const deletedCategory = await Category.destroy({
      where: { category_id: req.params.category_id },
    });

    if (!deletedCategory) {
      res.status(404).json({ message: 'No category with this id!' });
      return;
    }

    res.status(200).json({ message: 'Category and associated products deleted.' });

  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category and associated products' });
  }
});



module.exports = router;
