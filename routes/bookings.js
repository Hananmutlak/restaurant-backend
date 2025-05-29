const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authenticateToken = require('../middleware/authenticateToken');

// الحصول على جميع الحجوزات مع إمكانية الفلترة
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const bookings = await Booking.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// إنشاء حجز جديد
router.post('/', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// تحديث حالة الحجز
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    // تحقق من القيمة قبل التحديث
    const allowedStatuses = ["pending", "approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status value. Allowed values: ${allowedStatuses.join(', ')}`,
        received: status
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ 
      message: 'Update failed',
      error: err.message
    });
  }
});

// حذف الحجز
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;