const express = require('express');
const router = express.Router();
const db = require('./database');

router.post('/invoices/create', async (req, res) => {
  try {
    const invoice = await db.createInvoice(req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/invoices/:companyEmail', async (req, res) => {
  try {
    const invoices = await db.getInvoices(req.params.companyEmail);
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const invoice = await db.getInvoiceById(req.params.invoiceId);
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/invoice/:invoiceId', async (req, res) => {
  try {
    const invoice = await db.updateInvoice(req.params.invoiceId, req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/invoice/:invoiceId', async (req, res) => {
  try {
    await db.deleteInvoice(req.params.invoiceId);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/expenses/add', async (req, res) => {
  try {
    const expense = await db.addExpense(req.body);
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/expenses/:companyEmail', async (req, res) => {
  try {
    const expenses = await db.getExpenses(req.params.companyEmail);
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/expense/:expenseId', async (req, res) => {
  try {
    await db.deleteExpense(req.params.expenseId);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboard/:companyEmail', async (req, res) => {
  try {
    const stats = await db.getDashboardStats(req.params.companyEmail);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PRO UPGRADE ====================

router.get('/user-plan/:email', async (req, res) => {
  try {
    const plan = await db.getUserPlan(req.params.email);
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/upgrade-to-pro', async (req, res) => {
  try {
    const { userEmail, adminPassword } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'invoiceapp2024';
    
    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Invalid admin password' });
    }

    const result = await db.upgradeUserToPro(userEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/config', (req, res) => {
  res.json({
    mtnNumber: process.env.MTN_NUMBER || '+237 XXX XXX XXX',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@invoiceapp.cm'
  });
});

module.exports = router;