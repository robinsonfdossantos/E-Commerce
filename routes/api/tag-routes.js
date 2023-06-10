const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// ---------------------------------------------------------------------
// ------------------------ GET OK -------------------------------------
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  // find all tags
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
// ------------------------ GET BY ID OK -------------------------------
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
// ------------------------ CREATE OK ----------------------------------
// ---------------------------------------------------------------------
router.post('/', async (req, res) => {
  // create a new tag
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ UPDATE OK ----------------------------------
// ---------------------------------------------------------------------
router.put('/:tag_id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        tag_id: req.params.tag_id,
      },
    });

    res.json(updatedTag);
  } catch (err) {
    res.status(400).json(err);
  }
});

// ---------------------------------------------------------------------
// ------------------------ DELETE OK ----------------------------------
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

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
