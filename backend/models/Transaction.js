const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  type: {
    type: String,
    enum: ['given', 'received'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  refund_amount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  due_date: {
    type: Date
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  payment_method: {
    type: String,
    enum: ['cash', 'bank', 'mobile_banking', 'other'],
    default: 'cash'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
transactionSchema.index({ customer: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ customer: 1, date: -1 });

// Virtual for net amount
transactionSchema.virtual('netAmount').get(function() {
  return this.amount - this.refund_amount;
});

// Ensure virtual fields are serialized
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update customer balance
transactionSchema.pre('save', async function(next) {
  try {
    const Customer = mongoose.model('Customer');
    
    if (this.isNew) {
      // New transaction
      const customer = await Customer.findById(this.customer);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      if (this.type === 'given') {
        customer.total_given += this.amount;
        customer.due_amount += this.amount - this.refund_amount;
      } else {
        customer.total_received += this.amount;
        customer.due_amount -= this.amount - this.refund_amount;
      }
      
      await customer.save();
    } else if (this.isModified('amount') || this.isModified('type') || this.isModified('refund_amount')) {
      // Updated transaction - recalculate customer balance
      await this.constructor.recalculateCustomerBalance(this.customer);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove middleware to update customer balance
transactionSchema.pre('remove', async function(next) {
  try {
    const Customer = mongoose.model('Customer');
    
    const customer = await Customer.findById(this.customer);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    if (this.type === 'given') {
      customer.total_given -= this.amount;
      customer.due_amount -= this.amount - this.refund_amount;
    } else {
      customer.total_received -= this.amount;
      customer.due_amount += this.amount - this.refund_amount;
    }
    
    await customer.save();
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to recalculate customer balance
transactionSchema.statics.recalculateCustomerBalance = async function(customerId) {
  const Customer = mongoose.model('Customer');
  
  const transactions = await this.find({ customer: customerId });
  
  let totalGiven = 0;
  let totalReceived = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'given') {
      totalGiven += transaction.amount;
    } else {
      totalReceived += transaction.amount;
    }
  });
  
  const dueAmount = totalGiven - totalReceived;
  
  await Customer.findByIdAndUpdate(customerId, {
    total_given: totalGiven,
    total_received: totalReceived,
    due_amount: dueAmount
  });
};

module.exports = mongoose.model('Transaction', transactionSchema);
