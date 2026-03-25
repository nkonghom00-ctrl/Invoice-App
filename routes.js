const express = require('express');
const router = express.Router();
const db = require('./database');

// ==================== INVOICE ROUTES ====================

// Create invoice
router.post('/invoices/create', async (req, res) => {
  try {
    const invoice = await db.createInvoice(req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all invoices
router.get('/invoices/:companyEmail', async (req, res) => {
  try {
    const invoices = await db.getInvoices(req.params.companyEmail);
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single invoice
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const invoice = await db.getInvoiceById(req.params.invoiceId);
    if (invoice) {
      res.json({ success: true, invoice });
    } else {
      res.status(404).json({ success: false, error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update invoice
router.put('/invoice/:invoiceId', async (req, res) => {
  try {
    const invoice = await db.updateInvoice(req.params.invoiceId, req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete invoice
router.delete('/invoice/:invoiceId', async (req, res) => {
  try {
    await db.deleteInvoice(req.params.invoiceId);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== EXPENSE ROUTES ====================

// Add expense
router.post('/expenses/add', async (req, res) => {
  try {
    const expense = await db.addExpense(req.body);
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all expenses
router.get('/expenses/:companyEmail', async (req, res) => {
  try {
    const expenses = await db.getExpenses(req.params.companyEmail);
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete expense
router.delete('/expense/:expenseId', async (req, res) => {
  try {
    await db.deleteExpense(req.params.expenseId);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard stats
router.get('/dashboard/:companyEmail', async (req, res) => {
  try {
    const stats = await db.getDashboardStats(req.params.companyEmail);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;