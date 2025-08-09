const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all transaction routes
router.use(authenticateToken);

// Get all transactions with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('customerId').optional().isMongoId().withMessage('Invalid customer ID'),
  query('type').optional().isIn(['given', 'received']).withMessage('Type must be given or received'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('sortBy').optional().isIn(['date', 'amount', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      customerId,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { createdBy: req.user._id };
    
    if (customerId) {
      query.customer = customerId;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .populate('customer', 'name phone email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      message: 'Transactions retrieved successfully',
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve transactions',
      message: 'Something went wrong while retrieving transactions'
    });
  }
});

// Get transactions for a specific customer
router.get('/customer/:customerId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['given', 'received']).withMessage('Type must be given or received'),
  query('sortBy').optional().isIn(['date', 'amount', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    // Verify customer exists and belongs to user
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or you do not have access'
      });
    }

    const {
      page = 1,
      limit = 10,
      type,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { 
      customer: req.params.customerId,
      createdBy: req.user._id
    };
    
    if (type) {
      query.type = type;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      message: 'Customer transactions retrieved successfully',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          due_amount: customer.due_amount,
          total_given: customer.total_given,
          total_received: customer.total_received
        },
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get customer transactions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer transactions',
      message: 'Something went wrong while retrieving customer transactions'
    });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('customer', 'name phone email');

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction does not exist or you do not have access'
      });
    }

    res.json({
      message: 'Transaction retrieved successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      error: 'Failed to retrieve transaction',
      message: 'Something went wrong while retrieving transaction'
    });
  }
});

// Create new transaction
router.post('/', [
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('type')
    .isIn(['given', 'received'])
    .withMessage('Type must be given or received'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('refund_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be 0 or greater'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot be more than 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('payment_method')
    .optional()
    .isIn(['cash', 'bank', 'mobile_banking', 'other'])
    .withMessage('Invalid payment method')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const {
      customer: customerId,
      type,
      amount,
      refund_amount = 0,
      note,
      date,
      time,
      due_date,
      payment_method = 'cash'
    } = req.body;

    // Verify customer exists and belongs to user
    const customer = await Customer.findOne({
      _id: customerId,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or you do not have access'
      });
    }

    // Validate refund amount
    if (refund_amount >= amount) {
      return res.status(400).json({
        error: 'Invalid refund amount',
        message: 'Refund amount cannot be greater than or equal to the transaction amount'
      });
    }

    // Create new transaction
    const transaction = new Transaction({
      customer: customerId,
      type,
      amount,
      refund_amount,
      note,
      date: date || new Date(),
      time: time || new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      due_date: due_date ? new Date(due_date) : null,
      payment_method,
      createdBy: req.user._id
    });

    await transaction.save();

    // Populate customer info for response
    await transaction.populate('customer', 'name phone email');

    res.status(201).json({
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      error: 'Transaction creation failed',
      message: 'Something went wrong while creating transaction'
    });
  }
});

// Update transaction
router.put('/:id', [
  body('type')
    .optional()
    .isIn(['given', 'received'])
    .withMessage('Type must be given or received'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('refund_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be 0 or greater'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot be more than 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('payment_method')
    .optional()
    .isIn(['cash', 'bank', 'mobile_banking', 'other'])
    .withMessage('Invalid payment method')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction does not exist or you do not have access'
      });
    }

    const {
      type,
      amount,
      refund_amount,
      note,
      date,
      time,
      due_date,
      payment_method
    } = req.body;

    // Validate refund amount if amount is being updated
    if (refund_amount !== undefined && amount !== undefined && refund_amount >= amount) {
      return res.status(400).json({
        error: 'Invalid refund amount',
        message: 'Refund amount cannot be greater than or equal to the transaction amount'
      });
    }

    // Update transaction
    const updates = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (refund_amount !== undefined) updates.refund_amount = refund_amount;
    if (note !== undefined) updates.note = note;
    if (date !== undefined) updates.date = new Date(date);
    if (time !== undefined) updates.time = time;
    if (due_date !== undefined) updates.due_date = due_date ? new Date(due_date) : null;
    if (payment_method !== undefined) updates.payment_method = payment_method;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('customer', 'name phone email');

    res.json({
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      error: 'Transaction update failed',
      message: 'Something went wrong while updating transaction'
    });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction does not exist or you do not have access'
      });
    }

    await transaction.remove();

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      error: 'Transaction deletion failed',
      message: 'Something went wrong while deleting transaction'
    });
  }
});

// Get transaction statistics
router.get('/stats/overview', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get transaction statistics
    const stats = await Transaction.aggregate([
      { $match: { createdBy: req.user._id, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalGiven: {
            $sum: {
              $cond: [{ $eq: ['$type', 'given'] }, '$amount', 0]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [{ $eq: ['$type', 'received'] }, '$amount', 0]
            }
          },
          totalRefund: { $sum: '$refund_amount' }
        }
      }
    ]);

    const transactionStats = stats[0] || {
      totalTransactions: 0,
      totalGiven: 0,
      totalReceived: 0,
      totalRefund: 0
    };

    // Get customer statistics
    const customerStats = await Customer.aggregate([
      { $match: { createdBy: req.user._id, isActive: true } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalDueAmount: { $sum: '$due_amount' },
          totalGiven: { $sum: '$total_given' },
          totalReceived: { $sum: '$total_received' }
        }
      }
    ]);

    const customerData = customerStats[0] || {
      totalCustomers: 0,
      totalDueAmount: 0,
      totalGiven: 0,
      totalReceived: 0
    };

    res.json({
      message: 'Transaction statistics retrieved successfully',
      data: {
        transactions: {
          totalTransactions: transactionStats.totalTransactions,
          totalGiven: transactionStats.totalGiven,
          totalReceived: transactionStats.totalReceived,
          totalRefund: transactionStats.totalRefund,
          netBalance: transactionStats.totalGiven - transactionStats.totalReceived
        },
        customers: {
          totalCustomers: customerData.totalCustomers,
          totalDueAmount: customerData.totalDueAmount,
          totalGiven: customerData.totalGiven,
          totalReceived: customerData.totalReceived
        }
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve transaction statistics',
      message: 'Something went wrong while retrieving transaction statistics'
    });
  }
});

module.exports = router;
