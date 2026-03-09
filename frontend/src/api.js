// Use the environment variable for production (e.g., in Vercel)
const BASE_URL = import.meta.env.VITE_SwasthiQ_backend || 'http://localhost:8000';
// 

async function request(endpoint, options = {}) {
  // console.log(BASE_URL);
  // Ensure the endpoint starts with /api if it doesn't already
  const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = `${BASE_URL}${apiEndpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Dashboard APIs ────────────────────────────────────────
export const dashboardApi = {
  getSalesSummary: () => request('/dashboard/sales-summary'),
  getItemsSold: () => request('/dashboard/items-sold'),
  getLowStock: () => request('/dashboard/low-stock'),
  getPurchaseOrders: () => request('/dashboard/purchase-orders'),
  getRecentSales: () => request('/dashboard/recent-sales'),
};

// ─── Inventory APIs ────────────────────────────────────────
export const inventoryApi = {
  getSummary: () => request('/inventory/summary'),
  listMedicines: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    const qs = query.toString();
    return request(`/inventory${qs ? `?${qs}` : ''}`);
  },
  getMedicine: (id) => request(`/inventory/${id}`),
  createMedicine: (data) =>
    request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: (id, data) =>
    request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    request(`/inventory/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ─── Sales APIs ────────────────────────────────────────────
export const salesApi = {
  listSales: () => request('/sales'),
  createSale: (data) =>
    request('/sales', { method: 'POST', body: JSON.stringify(data) }),
};
