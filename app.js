let currentUser = null;
let currentCompanyName = '';
let userJoinDate = null;

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    addItemRow();
    setTodayDate();
});

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('dueDate')) document.getElementById('dueDate').value = today;
    if (document.getElementById('expenseDate')) document.getElementById('expenseDate').value = today;
}

function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAlert('❌ Please enter email and password', 'error');
        return;
    }

    if (!email.includes('@')) {
        showAlert('❌ Please enter a valid email', 'error');
        return;
    }

    currentUser = email;
    currentCompanyName = email.split('@')[0];
    userJoinDate = new Date().toLocaleDateString();

    localStorage.setItem('userEmail', email);
    localStorage.setItem('companyName', currentCompanyName);
    localStorage.setItem('joinDate', userJoinDate);

    document.getElementById('userEmail').textContent = email;
    document.getElementById('companyEmail').value = email;
    document.getElementById('settingsEmail').textContent = email;
    document.getElementById('settingsJoined').textContent = userJoinDate;

    document.getElementById('loginPage').classList.remove('active');
    showPage('dashboard');
    loadDashboard();
    showAlert('✅ Logged in!', 'success');
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('companyName');
        localStorage.removeItem('joinDate');
        currentUser = null;
        document.getElementById('loginPage').classList.add('active');
        document.querySelectorAll('.page:not(#loginPage)').forEach(page => {
            page.classList.remove('active');
        });
        showAlert('✅ Logged out!', 'success');
    }
}

function checkLogin() {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        currentUser = savedEmail;
        currentCompanyName = savedEmail.split('@')[0];
        userJoinDate = localStorage.getItem('joinDate') || new Date().toLocaleDateString();
        document.getElementById('userEmail').textContent = savedEmail;
        document.getElementById('companyEmail').value = savedEmail;
        document.getElementById('settingsEmail').textContent = savedEmail;
        document.getElementById('settingsJoined').textContent = userJoinDate;
        document.getElementById('loginPage').classList.remove('active');
        showPage('dashboard');
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    if (pageId !== 'loginPage' && !currentUser) {
        document.getElementById('loginPage').classList.add('active');
        return;
    }

    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    if (pageId === 'invoices') loadInvoices();
    if (pageId === 'expenses') loadExpenses();
    if (pageId === 'dashboard') loadDashboard();
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function addItemRow() {
    const itemsList = document.getElementById('itemsList');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" placeholder="Item name" class="item-name input-field">
        <input type="number" placeholder="Qty" value="1" min="1" class="item-qty input-field">
        <input type="number" placeholder="Price" class="item-price input-field" step="0.01" min="0">
        <button type="button" onclick="removeItemRow(this)" class="remove-item">Remove</button>
    `;
    itemsList.appendChild(row);
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', calculateTotal);
        input.addEventListener('input', calculateTotal);
    });
}

function removeItemRow(button) {
    button.parentElement.remove();
    calculateTotal();
}

function calculateTotal() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    document.getElementById('invoiceTotal').textContent = formatCurrency(total);
    return total;
}

async function saveInvoice() {
    const itemRows = document.querySelectorAll('.item-row');
    const items = [];
    itemRows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const qty = parseFloat(row.querySelector('.item-qty').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        if (name && qty && price) items.push({ name, quantity: qty, price });
    });

    if (items.length === 0) {
        showAlert('❌ Add at least one item', 'error');
        return;
    }

    const companyName = document.getElementById('companyName').value.trim();
    const clientName = document.getElementById('clientName').value.trim();

    if (!companyName || !clientName) {
        showAlert('❌ Fill company and client names', 'error');
        return;
    }

    const invoiceData = {
        companyName,
        companyEmail: currentUser,
        companyPhone: document.getElementById('companyPhone').value,
        clientName,
        clientEmail: document.getElementById('clientEmail').value,
        items,
        totalAmount: calculateTotal(),
        taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
        dueDate: document.getElementById('dueDate').value,
        notes: document.getElementById('notes').value
    };

    try {
        const response = await fetch('/api/invoices/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });
        const result = await response.json();
        if (result.success) {
            showAlert('✅ Invoice saved!', 'success');
            document.querySelector('.form-container').reset();
            document.getElementById('itemsList').innerHTML = '';
            addItemRow();
            setTodayDate();
            showPage('invoices');
            loadInvoices();
        }
    } catch (error) {
        showAlert('❌ Error saving invoice', 'error');
    }
}

async function loadInvoices() {
    try {
        const response = await fetch(`/api/invoices/${currentUser}`);
        const result = await response.json();
        if (result.success) displayInvoices(result.invoices);
    } catch (error) {
        showAlert('❌ Error loading invoices', 'error');
    }
}

function displayInvoices(invoices) {
    const invoicesList = document.getElementById('invoicesList');
    invoicesList.innerHTML = '';
    if (invoices.length === 0) {
        invoicesList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No invoices yet.</p>';
        return;
    }
    invoices.forEach(invoice => {
        const item = document.createElement('div');
        item.className = 'invoice-item';
        const createdDate = invoice.createdAt?.seconds 
            ? new Date(invoice.createdAt.seconds * 1000).toLocaleDateString()
            : new Date(invoice.createdAt).toLocaleDateString();
        item.innerHTML = `
            <div class="invoice-info">
                <h4>${invoice.clientName}</h4>
                <p>#${invoice.id.substring(0, 8)}</p>
                <p>${createdDate}</p>
            </div>
            <div class="invoice-amount">${formatCurrency(invoice.totalAmount)}</div>
            <span class="invoice-status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
            <button onclick="markInvoiceAs('${invoice.id}', 'sent')" class="btn-secondary" style="font-size: 11px; padding: 6px 10px;">Mark Sent</button>
            <button onclick="deleteInvoice('${invoice.id}')" class="btn-secondary" style="background: #ff6b6b; color: white; border: none; font-size: 11px; padding: 6px 10px;">Delete</button>
        `;
        invoicesList.appendChild(item);
    });
}

async function markInvoiceAs(invoiceId, status) {
    try {
        const response = await fetch(`/api/invoice/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (result.success) {
            showAlert(`✅ Marked as ${status}!`, 'success');
            loadInvoices();
        }
    } catch (error) {
        showAlert('❌ Error updating', 'error');
    }
}

async function deleteInvoice(invoiceId) {
    if (!confirm('Delete this invoice?')) return;
    try {
        const response = await fetch(`/api/invoice/${invoiceId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showAlert('✅ Deleted!', 'success');
            loadInvoices();
        }
    } catch (error) {
        showAlert('❌ Error', 'error');
    }
}

async function addExpense() {
    const category = document.getElementById('expenseCategory').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    const description = document.getElementById('expenseDescription').value.trim();

    if (!category || !amount || !date) {
        showAlert('❌ Fill all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/api/expenses/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyEmail: currentUser, category, amount, date, description })
        });
        const result = await response.json();
        if (result.success) {
            showAlert('✅ Expense added!', 'success');
            document.getElementById('expenseCategory').value = '';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('expenseDescription').value = '';
            loadExpenses();
            loadDashboard();
        }
    } catch (error) {
        showAlert('❌ Error', 'error');
    }
}

async function loadExpenses() {
    try {
        const response = await fetch(`/api/expenses/${currentUser}`);
        const result = await response.json();
        if (result.success) displayExpenses(result.expenses);
    } catch (error) {
        showAlert('❌ Error loading expenses', 'error');
    }
}

function displayExpenses(expenses) {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No expenses yet.</p>';
        return;
    }
    expenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        const expenseDate = new Date(expense.date).toLocaleDateString();
        item.innerHTML = `
            <div><h4>${expense.category}</h4><p>${expense.description || 'No description'}</p><p style="font-size: 12px; color: #999;">${expenseDate}</p></div>
            <div><p style="font-size: 18px; color: #ff6b6b; font-weight: bold;">${formatCurrency(expense.amount)}</p><button onclick="deleteExpense('${expense.id}')" class="btn-secondary" style="background: #ff6b6b; color: white; border: none; font-size: 11px; padding: 6px 10px;">Delete</button></div>
        `;
        expensesList.appendChild(item);
    });
}

async function deleteExpense(expenseId) {
    if (!confirm('Delete?')) return;
    try {
        const response = await fetch(`/api/expense/${expenseId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showAlert('✅ Deleted!', 'success');
            loadExpenses();
            loadDashboard();
        }
    } catch (error) {
        showAlert('❌ Error', 'error');
    }
}

async function loadDashboard() {
    try {
        const response = await fetch(`/api/dashboard/${currentUser}`);
        const result = await response.json();
        if (result.success) {
            const stats = result.stats;
            document.getElementById('totalInvoiced').textContent = formatCurrency(stats.totalInvoiced);
            document.getElementById('totalExpenses').textContent = formatCurrency(stats.totalExpenses);
            document.getElementById('netProfit').textContent = formatCurrency(stats.netProfit);
            document.getElementById('pendingInvoices').textContent = stats.pendingInvoices;
        }
        const invoicesResponse = await fetch(`/api/invoices/${currentUser}`);
        const invoicesResult = await invoicesResponse.json();
        if (invoicesResult.success) displayInvoicesPreview(invoicesResult.invoices.slice(0, 5));
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayInvoicesPreview(invoices) {
    const recentInvoices = document.getElementById('recentInvoices');
    recentInvoices.innerHTML = '';
    if (invoices.length === 0) {
        recentInvoices.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No invoices yet.</p>';
        return;
    }
    invoices.forEach(invoice => {
        const item = document.createElement('div');
        item.className = 'invoice-item';
        const createdDate = invoice.createdAt?.seconds 
            ? new Date(invoice.createdAt.seconds * 1000).toLocaleDateString()
            : new Date(invoice.createdAt).toLocaleDateString();
        item.innerHTML = `
            <div class="invoice-info"><h4>${invoice.clientName}</h4><p>#${invoice.id.substring(0, 8)}</p><p>${createdDate}</p></div>
            <div class="invoice-amount">${formatCurrency(invoice.totalAmount)}</div>
            <span class="invoice-status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
        `;
        recentInvoices.appendChild(item);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

function upgradePlan() {
    showAlert('🚀 Pro Plan: $3/month - Unlimited invoices! Email: support@invoiceapp.cm', 'info');
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(style);