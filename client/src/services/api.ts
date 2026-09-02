// API Service layer for StoreVerse-1.0 Backend with Fallback Mock Data

const API_BASE = '/api';

// Initial Mock Seed Data for Fallback/Offline mode
export const initialMockData = {
  stores: [
    {
      id: 1,
      storeName: "Aura Luxury Apparel",
      category: "Fashion & Lifestyle",
      subDomain: "aura-luxury",
      businessAddress: "742 Evergreen Terrace, San Francisco, CA",
      currency: "USD ($)",
      timeZone: "UTC-7 (Pacific Time)",
      contactEmail: "support@auraluxury.com",
      phoneNumber: "+1 (555) 234-5678",
      isActive: true,
      sslEnabled: true,
      primaryColor: "#6366f1",
      fontFamily: "Plus Jakarta Sans",
      storeLogoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      storeName: "CyberGadgets Tech",
      category: "Electronics",
      subDomain: "cybergadgets",
      businessAddress: "100 Innovation Way, Austin, TX",
      currency: "USD ($)",
      timeZone: "UTC-6 (Central Time)",
      contactEmail: "info@cybergadgets.com",
      phoneNumber: "+1 (555) 876-5432",
      isActive: true,
      sslEnabled: true,
      primaryColor: "#06b6d4",
      fontFamily: "Inter",
      storeLogoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80",
    }
  ],
  products: [
    {
      id: 101,
      storeId: 1,
      name: "Minimalist Cashmere Hoodie",
      category: "Clothing",
      price: "189.00",
      stock: 45,
      sku: "HOOD-CASH-001",
      barcode: "89340219401",
      status: "In Stock",
      description: "Ultra-soft 100% Mongolian cashmere hoodie with tailored fit.",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 102,
      storeId: 1,
      name: "Italian Leather Tote Bag",
      category: "Accessories",
      price: "245.00",
      stock: 12,
      sku: "BAG-LTHR-002",
      barcode: "89340219402",
      status: "In Stock",
      description: "Handcrafted full-grain Italian leather bag with brass hardware.",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 103,
      storeId: 1,
      name: "Chronograph Obsidian Watch",
      category: "Watches",
      price: "320.00",
      stock: 4,
      sku: "WTCH-OBS-003",
      barcode: "89340219403",
      status: "Low Stock",
      description: "Sapphire glass water-resistant automatic timepiece.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 104,
      storeId: 1,
      name: "Silk Satin Midi Dress",
      category: "Clothing",
      price: "165.00",
      stock: 0,
      sku: "DRS-SLK-004",
      barcode: "89340219404",
      status: "Out of Stock",
      description: "Elegant emerald green silk midi dress with open back.",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"
    }
  ],
  orders: [
    {
      id: 5001,
      storeId: 1,
      orderNumber: "ORD-9821",
      customerName: "Eleanor Vance",
      customerEmail: "eleanor.v@example.com",
      customerPhone: "+1 (555) 998-1122",
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "Credit Card",
      transactionId: "txn_3N82910481",
      subtotal: "434.00",
      tax: "34.72",
      shippingFee: "15.00",
      total: "483.72",
      itemCount: 2,
      shippingRecipient: "Eleanor Vance",
      shippingStreet: "124 Ocean Drive",
      shippingCity: "Miami",
      shippingState: "FL",
      shippingPostal: "33139",
      shippingCountry: "United States",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      items: [
        { productName: "Minimalist Cashmere Hoodie", quantity: 1, unitPrice: "189.00", lineTotal: "189.00" },
        { productName: "Italian Leather Tote Bag", quantity: 1, unitPrice: "245.00", lineTotal: "245.00" }
      ]
    },
    {
      id: 5002,
      storeId: 1,
      orderNumber: "ORD-9822",
      customerName: "Marcus Sterling",
      customerEmail: "marcus.s@example.com",
      customerPhone: "+1 (555) 443-8899",
      status: "pending",
      paymentStatus: "paid",
      paymentMethod: "PayPal",
      transactionId: "txn_3N82910482",
      subtotal: "320.00",
      tax: "25.60",
      shippingFee: "0.00",
      total: "345.60",
      itemCount: 1,
      shippingRecipient: "Marcus Sterling",
      shippingStreet: "55 Wall Street Apt 14B",
      shippingCity: "New York",
      shippingState: "NY",
      shippingPostal: "10005",
      shippingCountry: "United States",
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      items: [
        { productName: "Chronograph Obsidian Watch", quantity: 1, unitPrice: "320.00", lineTotal: "320.00" }
      ]
    },
    {
      id: 5003,
      storeId: 1,
      orderNumber: "ORD-9823",
      customerName: "Sophia Lin",
      customerEmail: "sophia.lin@example.com",
      customerPhone: "+1 (555) 223-9900",
      status: "shipped",
      paymentStatus: "paid",
      paymentMethod: "Apple Pay",
      transactionId: "txn_3N82910483",
      subtotal: "189.00",
      tax: "15.12",
      shippingFee: "10.00",
      total: "214.12",
      itemCount: 1,
      shippingRecipient: "Sophia Lin",
      shippingStreet: "88 Market St",
      shippingCity: "San Francisco",
      shippingState: "CA",
      shippingPostal: "94105",
      shippingCountry: "United States",
      createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
      items: [
        { productName: "Minimalist Cashmere Hoodie", quantity: 1, unitPrice: "189.00", lineTotal: "189.00" }
      ]
    }
  ],
  customers: [
    {
      customerId: 201,
      storeId: 1,
      firstName: "Eleanor",
      lastName: "Vance",
      email: "eleanor.v@example.com",
      phone: "+1 (555) 998-1122",
      status: "active",
      address: "124 Ocean Drive, Miami, FL",
      preferedLanguage: "English",
      preferedCurrency: "USD",
      tags: "VIP, Repeat Buyer",
      notes: "Prefers gift wrap packaging and fast shipping.",
      orderCount: 8,
      totalSpent: 2450,
      emailMarketing: true,
      smsMarketing: true,
      createdAt: "2025-11-12T10:00:00Z"
    },
    {
      customerId: 202,
      storeId: 1,
      firstName: "Marcus",
      lastName: "Sterling",
      email: "marcus.s@example.com",
      phone: "+1 (555) 443-8899",
      status: "active",
      address: "55 Wall Street Apt 14B, New York, NY",
      preferedLanguage: "English",
      preferedCurrency: "USD",
      tags: "Watch Enthusiast",
      notes: "Enquired about premium leather warranty.",
      orderCount: 3,
      totalSpent: 980,
      emailMarketing: true,
      smsMarketing: false,
      createdAt: "2026-01-05T14:20:00Z"
    },
    {
      customerId: 203,
      storeId: 1,
      firstName: "Sophia",
      lastName: "Lin",
      email: "sophia.lin@example.com",
      phone: "+1 (555) 223-9900",
      status: "active",
      address: "88 Market St, San Francisco, CA",
      preferedLanguage: "English",
      preferedCurrency: "USD",
      tags: "New Customer",
      notes: "Signed up via Instagram ad campaign.",
      orderCount: 1,
      totalSpent: 214,
      emailMarketing: false,
      smsMarketing: false,
      createdAt: "2026-02-01T09:15:00Z"
    }
  ],
  inventory: [
    {
      id: 301,
      storeId: 1,
      productName: "Minimalist Cashmere Hoodie",
      warehouseName: "West Coast Fulfillment Hub",
      quantity: 35,
      sku: "HOOD-CASH-001"
    },
    {
      id: 302,
      storeId: 1,
      productName: "Minimalist Cashmere Hoodie",
      warehouseName: "East Coast Metro Warehouse",
      quantity: 10,
      sku: "HOOD-CASH-001"
    },
    {
      id: 303,
      storeId: 1,
      productName: "Italian Leather Tote Bag",
      warehouseName: "West Coast Fulfillment Hub",
      quantity: 12,
      sku: "BAG-LTHR-002"
    },
    {
      id: 304,
      storeId: 1,
      productName: "Chronograph Obsidian Watch",
      warehouseName: "Central Vault Warehouse",
      quantity: 4,
      sku: "WTCH-OBS-003"
    }
  ],
  campaigns: [
    {
      id: 401,
      storeId: 1,
      name: "Spring Cashmere Exclusive Sale",
      channel: "Email",
      customerSegment: "VIP, Repeat Buyer",
      messageContent: "Enjoy 20% off all luxury cashmere hoodies this weekend only! Use code VIPSPRING.",
      schedule: "send_now",
      status: "active",
      audience: 1420,
      sent: 1420,
      opens: 890,
      clicks: 340,
      conversions: 84,
      createdAt: "2026-02-04T12:00:00Z"
    },
    {
      id: 402,
      storeId: 1,
      name: "Obsidian Timepiece VIP Restock",
      channel: "SMS",
      customerSegment: "Watch Enthusiast",
      messageContent: "Limited stock alert: Chronograph Obsidian Watch back in stock!",
      schedule: "scheduled",
      scheduledAt: "2026-08-15T18:00:00Z",
      status: "active",
      audience: 450,
      sent: 0,
      opens: 0,
      clicks: 0,
      conversions: 0,
      createdAt: "2026-02-08T09:30:00Z"
    }
  ],
  team: [
    {
      id: 601,
      storeId: 1,
      name: "Eminioluwa (You)",
      email: "owner@storeverse.com",
      role: "Store Owner",
      status: "active",
      createdAt: "2025-10-01T08:00:00Z"
    },
    {
      id: 602,
      storeId: 1,
      name: "Sarah Jenkins",
      email: "sarah.j@auraluxury.com",
      role: "Store Manager",
      status: "active",
      createdAt: "2025-11-15T10:30:00Z"
    },
    {
      id: 603,
      storeId: 1,
      name: "David Chen",
      email: "david.c@auraluxury.com",
      role: "Support Specialist",
      status: "invited",
      createdAt: "2026-02-02T14:10:00Z"
    }
  ]
};

// Generic Fetch Wrapper with Automatic Mock Fallback
async function apiRequest<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn(`[API] Remote call to ${url} failed or offline. Falling back to client state.`);
  }

  if (fallbackData !== undefined) {
    return fallbackData;
  }
  throw new Error(`API Request to ${url} failed.`);
}

export const StoreVerseAPI = {
  // Store APIs
  async getStores(userId = 1) {
    return apiRequest(`/store/user-stores/${userId}`, {}, initialMockData.stores);
  },

  async createStore(storeData: any) {
    const newStore = { id: Date.now(), ...storeData, isActive: true, sslEnabled: true };
    initialMockData.stores.push(newStore);
    return apiRequest('/store/add-store', {
      method: 'POST',
      body: JSON.stringify(storeData)
    }, newStore);
  },

  async updateStore(storeId: number, storeData: any) {
    const idx = initialMockData.stores.findIndex(s => s.id === storeId);
    if (idx !== -1) {
      initialMockData.stores[idx] = { ...initialMockData.stores[idx], ...storeData };
    }
    return apiRequest(`/store/UpdateStore/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(storeData)
    }, initialMockData.stores[idx] || storeData);
  },

  // Products API
  async getProducts(storeId = 1) {
    return apiRequest(`/product/store-products/${storeId}`, {}, initialMockData.products.filter(p => p.storeId === storeId));
  },

  async addProduct(productData: any) {
    const newProduct = {
      id: Date.now(),
      status: productData.stock > 10 ? "In Stock" : productData.stock > 0 ? "Low Stock" : "Out of Stock",
      ...productData
    };
    initialMockData.products.unshift(newProduct);
    return apiRequest('/product/add-product', {
      method: 'POST',
      body: JSON.stringify(productData)
    }, newProduct);
  },

  async updateProduct(productId: number, productData: any) {
    const idx = initialMockData.products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      initialMockData.products[idx] = { ...initialMockData.products[idx], ...productData };
    }
    return apiRequest(`/product/update-product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }, initialMockData.products[idx] || productData);
  },

  // Orders API
  async getOrders(storeId = 1) {
    return apiRequest(`/orders/${storeId}`, {}, initialMockData.orders.filter(o => o.storeId === storeId));
  },

  async updateOrderStatus(orderId: number, status: string) {
    const order = initialMockData.orders.find(o => o.id === orderId);
    if (order) order.status = status;
    return apiRequest(`/orders/status/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, order || { id: orderId, status });
  },

  async createOrder(orderData: any) {
    const newOrder = {
      id: Date.now(),
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      ...orderData
    };
    initialMockData.orders.unshift(newOrder);
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }, newOrder);
  },

  // Customers API
  async getCustomers(storeId = 1) {
    return apiRequest(`/customer/get-customers/${storeId}`, {}, initialMockData.customers.filter(c => c.storeId === storeId));
  },

  async addCustomer(customerData: any) {
    const newCustomer = {
      customerId: Date.now(),
      orderCount: 0,
      totalSpent: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      ...customerData
    };
    initialMockData.customers.unshift(newCustomer);
    return apiRequest('/customer/add-customer', {
      method: 'POST',
      body: JSON.stringify(customerData)
    }, newCustomer);
  },

  // Inventory API
  async getInventory(storeId = 1) {
    return apiRequest(`/inventory/store-inventory/${storeId}`, {}, initialMockData.inventory.filter(i => i.storeId === storeId));
  },

  async adjustStock(inventoryId: number, delta: number) {
    const item = initialMockData.inventory.find(i => i.id === inventoryId);
    if (item) {
      item.quantity = Math.max(0, item.quantity + delta);
    }
    return apiRequest(`/inventory/adjust-stock/${inventoryId}`, {
      method: 'PUT',
      body: JSON.stringify({ delta })
    }, item);
  },

  // Marketing API
  async getCampaigns(storeId = 1) {
    return apiRequest(`/campaign/store/${storeId}`, {}, initialMockData.campaigns.filter(c => c.storeId === storeId));
  },

  async createCampaign(campaignData: any) {
    const newCampaign = {
      id: Date.now(),
      sent: campaignData.schedule === 'send_now' ? campaignData.audience || 500 : 0,
      opens: 0,
      clicks: 0,
      conversions: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      ...campaignData
    };
    initialMockData.campaigns.unshift(newCampaign);
    return apiRequest('/campaign/add', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    }, newCampaign);
  },

  // Team API
  async getTeamMembers(storeId = 1) {
    return apiRequest(`/team/${storeId}`, {}, initialMockData.team.filter(t => t.storeId === storeId));
  },

  async inviteTeamMember(teamData: any) {
    const newMember = {
      id: Date.now(),
      status: 'invited',
      createdAt: new Date().toISOString(),
      ...teamData
    };
    initialMockData.team.push(newMember);
    return apiRequest('/team/invite', {
      method: 'POST',
      body: JSON.stringify(teamData)
    }, newMember);
  }
};
