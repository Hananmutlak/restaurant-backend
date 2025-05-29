const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerName: { 
    type: String, 
    required: [true, 'Customer name is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'] 
  },
  numberOfPeople: { 
    type: Number, 
    required: [true, 'Number of people is required'],
    min: [1, 'At least 1 person required'] 
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Invalid phone number format']
  },
  status: { 
    type: String, 
    enum: {
      values: ["pending", "approved", "rejected"],
      message: 'Invalid status value'
    },
    default: "pending" 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// إضافة فهرس للحقول المستخدمة بكثرة
bookingSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);