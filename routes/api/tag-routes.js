const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// ---------------------------------------------------------------------
// ------------------------ GET ALL TAGS -------------------------------
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ GET TAG BY ID ------------------------------
// ---------------------------------------------------------------------
router.get('/:tag_id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.tag_id, {
      include: [{ model: Product, through: ProductTag }],
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ CREATE TAG BY ID ---------------------------
// ---------------------------------------------------------------------
router.post('/', async (req, res) => {
  // create a new tag
  try {
    const tagData = await Tag.create(req.body);

    if (req.body.productIds && req.body.productIds.length > 0) {
      // Find the products by their IDs
      const products = await Product.findAll({
        where: {
          product_id: req.body.productIds,
        },
      });

      // Add the found products to the tag
      await tagData.addProducts(products);
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ UPDATE TAG BY ID ---------------------------
// ---------------------------------------------------------------------
router.put('/:tag_id', async (req, res) => {
  try {

    const tagData = await Tag.findByPk(req.params.tag_id);

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    await tagData.update(req.body);  //Update the tag's name

    // Update the associated products 
    if (req.body.productIds && Array.isArray(req.body.productIds)) {
      await tagData.setProducts(req.body.productIds);
    }

    // Link the updated tag with the associated products
    const updatedTag = await Tag.findByPk(req.params.tag_id, {
      include: [{ model: Product, through: ProductTag }],
    });

    res.status(200).json(updatedTag);
  } catch (err) {
    res.status(400).json(err);
  }
});


// ---------------------------------------------------------------------
// ------------------------ DELETE TAG BY ID ---------------------------
// ---------------------------------------------------------------------
router.delete('/:tag_id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: { tag_id: req.params.tag_id },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json({ message: 'Tag deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
