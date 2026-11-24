import Product from '../model/userModel.js';


export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};


export const getAllProducts = async (req, res, next) => {
  try {
    const { category, supplier, search, sort, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (supplier) filter.supplier = supplier;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort || '-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};


export const getLowStockProducts = async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    res.status(200).json({
      count: lowStockItems.length,
      lowStockItems
    });
  } catch (err) {
    next(err);
  }
};


export const getInventorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { totalStockValue: -1 } }
    ]);

    res.status(200).json({
      categories: summary.length,
      summary
    });
  } catch (err) {
    next(err);
  }
};


export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};


export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};


export const adjustProductStock = async (req, res, next) => {
  try {
    const { change } = req.body;
    if (typeof change !== 'number') {
      return res.status(400).json({ message: 'Stock change must be a number' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity + change < 0) {
      return res.status(400).json({ message: 'Insufficient stock for this operation' });
    }

    product.quantity += change;
    await product.save();

    res.status(200).json({
      message: 'Stock updated',
      product
    });
  } catch (err) {
    next(err);
  }
};


export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      message: 'Product deleted',
      id: req.params.id
    });
  } catch (err) {
    next(err);
  }
};