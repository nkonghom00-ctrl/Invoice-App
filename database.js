const admin = require('firebase-admin');
require('dotenv').config();

let db;

try {
  const firebaseConfig = process.env.FIREBASE_CONFIG 
    ? JSON.parse(process.env.FIREBASE_CONFIG)
    : {};

  if (Object.keys(firebaseConfig).length > 0) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    db = admin.firestore();
    console.log('✅ Firebase connected');
  } else {
    console.warn('⚠️ Firebase not configured. Using demo mode.');
  }
} catch (error) {
  console.error('Firebase error:', error.message);
}

const demoData = { invoices: [], expenses: [] };

async function createInvoice(invoiceData) {
  try {
    if (!db) return createInvoiceDemo(invoiceData);
    const invoiceRef = db.collection('invoices').doc();
    const invoiceId = invoiceRef.id;
    const newInvoice = {
      id: invoiceId,
      companyName: invoiceData.companyName || 'Unnamed Company',
      companyEmail: invoiceData.companyEmail,
      companyPhone: invoiceData.companyPhone || '',
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail || '',
      items: invoiceData.items || [],
      totalAmount: invoiceData.totalAmount || 0,
      taxRate: invoiceData.taxRate || 0,
      createdAt: new Date(),
      dueDate: invoiceData.dueDate || '',
      status: 'draft',
      notes: invoiceData.notes || ''
    };
    await invoiceRef.set(newInvoice);
    return newInvoice;
  } catch (error) {
    return createInvoiceDemo(invoiceData);
  }
}

function createInvoiceDemo(invoiceData) {
  const invoiceId = 'invoice_' + Date.now();
  const newInvoice = {
    id: invoiceId,
    companyName: invoiceData.companyName || 'Unnamed Company',
    companyEmail: invoiceData.companyEmail,
    companyPhone: invoiceData.companyPhone || '',
    clientName: invoiceData.clientName,
    clientEmail: invoiceData.clientEmail || '',
    items: invoiceData.items || [],
    totalAmount: invoiceData.totalAmount || 0,
    taxRate: invoiceData.taxRate || 0,
    createdAt: new Date(),
    dueDate: invoiceData.dueDate || '',
    status: 'draft',
    notes: invoiceData.notes || ''
  };
  demoData.invoices.push(newInvoice);
  return newInvoice;
}

async function getInvoices(companyEmail) {
  try {
    if (!db) return getInvoicesDemo(companyEmail);
    const snapshot = await db.collection('invoices')
      .where('companyEmail', '==', companyEmail)
      .orderBy('createdAt', 'desc')
      .get();
    const invoices = [];
    snapshot.forEach(doc => invoices.push(doc.data()));
    return invoices;
  } catch (error) {
    return getInvoicesDemo(companyEmail);
  }
}

function getInvoicesDemo(companyEmail) {
  return demoData.invoices
    .filter(inv => inv.companyEmail === companyEmail)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getInvoiceById(invoiceId) {
  try {
    if (!db) return getInvoiceByIdDemo(invoiceId);
    const doc = await db.collection('invoices').doc(invoiceId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    return getInvoiceByIdDemo(invoiceId);
  }
}

function getInvoiceByIdDemo(invoiceId) {
  return demoData.invoices.find(inv => inv.id === invoiceId) || null;
}

async function updateInvoice(invoiceId, updates) {
  try {
    if (!db) return updateInvoiceDemo(invoiceId, updates);
    await db.collection('invoices').doc(invoiceId).update(updates);
    return await getInvoiceById(invoiceId);
  } catch (error) {
    return updateInvoiceDemo(invoiceId, updates);
  }
}

function updateInvoiceDemo(invoiceId, updates) {
  const index = demoData.invoices.findIndex(inv => inv.id === invoiceId);
  if (index !== -1) {
    demoData.invoices[index] = { ...demoData.invoices[index], ...updates };
    return demoData.invoices[index];
  }
  return null;
}

async function deleteInvoice(invoiceId) {
  try {
    if (!db) return deleteInvoiceDemo(invoiceId);
    await db.collection('invoices').doc(invoiceId).delete();
    return { success: true, message: 'Invoice deleted' };
  } catch (error) {
    return deleteInvoiceDemo(invoiceId);
  }
}

function deleteInvoiceDemo(invoiceId) {
  const index = demoData.invoices.findIndex(inv => inv.id === invoiceId);
  if (index !== -1) demoData.invoices.splice(index, 1);
  return { success: true, message: 'Invoice deleted' };
}

async function addExpense(expenseData) {
  try {
    if (!db) return addExpenseDemo(expenseData);
    const expenseRef = db.collection('expenses').doc();
    const expenseId = expenseRef.id;
    const newExpense = {
      id: expenseId,
      companyEmail: expenseData.companyEmail,
      category: expenseData.category,
      amount: expenseData.amount || 0,
      description: expenseData.description || '',
      date: expenseData.date,
      createdAt: new Date()
    };
    await expenseRef.set(newExpense);
    return newExpense;
  } catch (error) {
    return addExpenseDemo(expenseData);
  }
}

function addExpenseDemo(expenseData) {
  const expenseId = 'expense_' + Date.now();
  const newExpense = {
    id: expenseId,
    companyEmail: expenseData.companyEmail,
    category: expenseData.category,
    amount: expenseData.amount || 0,
    description: expenseData.description || '',
    date: expenseData.date,
    createdAt: new Date()
  };
  demoData.expenses.push(newExpense);
  return newExpense;
}

async function getExpenses(companyEmail) {
  try {
    if (!db) return getExpensesDemo(companyEmail);
    const snapshot = await db.collection('expenses')
      .where('companyEmail', '==', companyEmail)
      .orderBy('date', 'desc')
      .get();
    const expenses = [];
    snapshot.forEach(doc => expenses.push(doc.data()));
    return expenses;
  } catch (error) {
    return getExpensesDemo(companyEmail);
  }
}

function getExpensesDemo(companyEmail) {
  return demoData.expenses
    .filter(exp => exp.companyEmail === companyEmail)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function deleteExpense(expenseId) {
  try {
    if (!db) return deleteExpenseDemo(expenseId);
    await db.collection('expenses').doc(expenseId).delete();
    return { success: true, message: 'Expense deleted' };
  } catch (error) {
    return deleteExpenseDemo(expenseId);
  }
}

function deleteExpenseDemo(expenseId) {
  const index = demoData.expenses.findIndex(exp => exp.id === expenseId);
  if (index !== -1) demoData.expenses.splice(index, 1);
  return { success: true, message: 'Expense deleted' };
}

async function getDashboardStats(companyEmail) {
  try {
    if (!db) return getDashboardStatsDemo(companyEmail);
    const invoicesSnapshot = await db.collection('invoices')
      .where('companyEmail', '==', companyEmail)
      .get();
    let totalInvoiced = 0, paidInvoices = 0, pendingInvoices = 0;
    invoicesSnapshot.forEach(doc => {
      const invoice = doc.data();
      totalInvoiced += invoice.totalAmount || 0;
      if (invoice.status === 'paid') paidInvoices++;
      else if (invoice.status === 'sent') pendingInvoices++;
    });
    const expensesSnapshot = await db.collection('expenses')
      .where('companyEmail', '==', companyEmail)
      .get();
    let totalExpenses = 0;
    expensesSnapshot.forEach(doc => {
      totalExpenses += doc.data().amount || 0;
    });
    return {
      totalInvoiced, totalExpenses,
      netProfit: totalInvoiced - totalExpenses,
      paidInvoices, pendingInvoices,
      totalInvoices: invoicesSnapshot.size,
      totalExpensesCount: expensesSnapshot.size
    };
  } catch (error) {
    return getDashboardStatsDemo(companyEmail);
  }
}

function getDashboardStatsDemo(companyEmail) {
  const invoices = demoData.invoices.filter(inv => inv.companyEmail === companyEmail);
  const expenses = demoData.expenses.filter(exp => exp.companyEmail === companyEmail);
  let totalInvoiced = 0, paidInvoices = 0, pendingInvoices = 0;
  invoices.forEach(inv => {
    totalInvoiced += inv.totalAmount || 0;
    if (inv.status === 'paid') paidInvoices++;
    else if (inv.status === 'sent') pendingInvoices++;
  });
  let totalExpenses = 0;
  expenses.forEach(exp => {
    totalExpenses += exp.amount || 0;
  });
  return {
    totalInvoiced, totalExpenses,
    netProfit: totalInvoiced - totalExpenses,
    paidInvoices, pendingInvoices,
    totalInvoices: invoices.length,
    totalExpensesCount: expenses.length
  };
}

module.exports = { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice, addExpense, getExpenses, deleteExpense, getDashboardStats };