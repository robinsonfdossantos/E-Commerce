const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const { route } = require('./category-routes');

// ---------------------------------------------------------------------
// ------------------------ GET ALL PRODUCTS ---------------------------
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }

});

// ---------------------------------------------------------------------
// ------------------------ GET PRODUCT BY ID --------------------------
// ---------------------------------------------------------------------
router.get('/:product_id', async (req, res) => {

  try {
    const productData = await Product.findByPk(req.params.product_id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ CREATE PRODUCT -----------------------------
// ---------------------------------------------------------------------
router.post('/', (req, res) => {

  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.product_id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// ---------------------------------------------------------------------
// ------------------------ UPDATE PRODUCT -----------------------------
// ---------------------------------------------------------------------
router.put('/:product_id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      product_id: req.params.product_id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ tag_id }) => tag_id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { tag_id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// ---------------------------------------------------------------------
// ------------------------ DELETE PRODUCT BY ID -----------------------
// ---------------------------------------------------------------------
router.delete('/:product_id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: { product_id: req.params.product_id },
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------------------
// --------- GET ALL PRODUCTS WHERE CATEGORY ID IS NULL ----------------
// ---------------------------------------------------------------------
router.get('/category/:category_id', async (req, res) => {
  try {
    const productData = await Product.findAll({
      where: {
        category_id: null,
      },
      include: [{ model: Category, required: false }, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;



