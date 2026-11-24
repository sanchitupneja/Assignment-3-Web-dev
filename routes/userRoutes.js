import express from 'express';
import {
  createProduct,
  getAllProducts,
  getLowStockProducts,
  getInventorySummary,
  getProductById,
  updateProduct,
  adjustProductStock,
  deleteProduct
} from '../controllers/user.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/summary', getInventorySummary);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.patch('/:id/stock', adjustProductStock);
router.delete('/:id', deleteProduct);

export default router;