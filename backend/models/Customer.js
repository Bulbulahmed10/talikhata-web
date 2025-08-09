const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  photo_url: {
    type: String,
    trim: true
  },
  due_amount: {
    type: Number,
    default: 0,
    min: [0, 'Due amount cannot be negative']
  },
  total_received: {
    type: Number,
    default: 0,
    min: [0, 'Total received cannot be negative']
  },
  total_given: {
    type: Number,
    default: 0,
    min: [0, 'Total given cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ createdBy: 1 });
customerSchema.index({ isActive: 1 });

// Virtual for net balance
customerSchema.virtual('netBalance').get(function() {
  return this.total_given - this.total_received;
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update totals
customerSchema.pre('save', function(next) {
  // This will be handled by the transaction triggers
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
