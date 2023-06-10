const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// The `/api/categories` endpoint
 
// ---------------------------------------------------------------------
// ------------------------ GET OK -------------------------------------
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: { model: Product,
        attributes: ['product_id', 'product_name'],
      },
    });
    res.status(200).json(categoryData);
  } catch (err) {
    console.log(err); // Print the error for debugging purposes
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// ---------------------------------------------------------------------
// ------------------------ GET BU ID OK -------------------------------
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
// ------------------------ CREATE OK ----------------------------------
// ---------------------------------------------------------------------
router.post('/', async (req, res) => {
  // create a new category
  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ UPDATE OK ----------------------------------
// ---------------------------------------------------------------------
router.put('/:category_id', async (req, res) => {
  // update a category by its `id` value
  try {
    const updatedCategory = await Category.update(
      { category_name: req.body.category_name },
      {
        where: { category_id: req.params.category_id },
      }
    );
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ------------------------------------------------------------------------------------

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

  res.status(200).json(deletedCategory);

  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});


module.exports = router;
