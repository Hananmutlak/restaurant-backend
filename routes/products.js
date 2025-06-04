const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');

// إضافة منتج جديد بدون صورة
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, price, available } = req.body;
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      available: available === 'true' || available === '1'
    });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('خطأ في إضافة المنتج:', err.message);
    res.status(500).json({ error: 'فشل في إضافة المنتج' });
  }
});

// تعديل منتج بدون صورة
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.price) updates.price = parseFloat(req.body.price);
    if (req.body.available !== undefined) {
      updates.available = req.body.available === 'true' || req.body.available === '1';
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error('خطأ في تعديل المنتج:', err.message);
    res.status(500).json({ error: 'فشل في تعديل المنتج' });
  }
});

// حذف منتج
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف المنتج:', err.message);
    res.status(500).json({ error: 'فشل في حذف المنتج' });
  }
});

// جلب كل المنتجات
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('خطأ في تحميل المنتجات:', err.message);
    res.status(500).json({ error: 'فشل في تحميل المنتجات' });
  }
});
// جلب منتج واحد
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'فشل في جلب المنتج' });
  }
});

module.exports = router;
