const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticateToken);

// Get all customers with pagination and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['name', 'due_amount', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
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
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { createdBy: req.user._id, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Customer.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      message: 'Customers retrieved successfully',
      data: customers,
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
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customers',
      message: 'Something went wrong while retrieving customers'
    });
  }
});

// Get customer by ID with transactions
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or you do not have access'
      });
    }

    // Get recent transactions for this customer
    const transactions = await Transaction.find({
      customer: req.params.id
    })
    .sort({ date: -1, time: -1 })
    .limit(10)
    .lean();

    res.json({
      message: 'Customer retrieved successfully',
      data: {
        ...customer.toObject(),
        recentTransactions: transactions
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer',
      message: 'Something went wrong while retrieving customer'
    });
  }
});

// Create new customer
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+880|880|0)?1[3-9]\d{8}$/)
    .withMessage('Please enter a valid Bangladeshi phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot be more than 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('photo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL for photo'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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

    const { name, phone, email, address, description, photo_url, tags } = req.body;

    // Check if customer with same phone/email already exists
    const existingCustomer = await Customer.findOne({
      createdBy: req.user._id,
      isActive: true,
      $or: [
        ...(phone ? [{ phone }] : []),
        ...(email ? [{ email }] : [])
      ]
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: 'Customer creation failed',
        message: 'Customer with this phone number or email already exists'
      });
    }

    // Create new customer
    const customer = new Customer({
      name,
      phone,
      email,
      address,
      description,
      photo_url,
      tags: tags || [],
      createdBy: req.user._id
    });

    await customer.save();

    res.status(201).json({
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      error: 'Customer creation failed',
      message: 'Something went wrong while creating customer'
    });
  }
});

// Update customer
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+880|880|0)?1[3-9]\d{8}$/)
    .withMessage('Please enter a valid Bangladeshi phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot be more than 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('photo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL for photo'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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

    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or you do not have access'
      });
    }

    const { name, phone, email, address, description, photo_url, tags } = req.body;

    // Check if phone/email is already taken by another customer
    if (phone || email) {
      const existingCustomer = await Customer.findOne({
        _id: { $ne: req.params.id },
        createdBy: req.user._id,
        isActive: true,
        $or: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingCustomer) {
        return res.status(400).json({
          error: 'Customer update failed',
          message: 'Phone number or email is already taken by another customer'
        });
      }
    }

    // Update customer
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (description !== undefined) updates.description = description;
    if (photo_url !== undefined) updates.photo_url = photo_url;
    if (tags !== undefined) updates.tags = tags;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Customer updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      error: 'Customer update failed',
      message: 'Something went wrong while updating customer'
    });
  }
});

// Delete customer (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or you do not have access'
      });
    }

    // Check if customer has transactions
    const transactionCount = await Transaction.countDocuments({
      customer: req.params.id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        error: 'Customer deletion failed',
        message: 'Cannot delete customer with existing transactions'
      });
    }

    // Soft delete
    customer.isActive = false;
    await customer.save();

    res.json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      error: 'Customer deletion failed',
      message: 'Something went wrong while deleting customer'
    });
  }
});

// Get customer statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or you do not have access'
      });
    }

    // Get transaction statistics
    const stats = await Transaction.aggregate([
      { $match: { customer: customer._id } },
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

    res.json({
      message: 'Customer statistics retrieved successfully',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          due_amount: customer.due_amount,
          total_given: customer.total_given,
          total_received: customer.total_received
        },
        statistics: {
          totalTransactions: transactionStats.totalTransactions,
          totalGiven: transactionStats.totalGiven,
          totalReceived: transactionStats.totalReceived,
          totalRefund: transactionStats.totalRefund,
          netBalance: transactionStats.totalGiven - transactionStats.totalReceived
        }
      }
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer statistics',
      message: 'Something went wrong while retrieving customer statistics'
    });
  }
});

module.exports = router;
