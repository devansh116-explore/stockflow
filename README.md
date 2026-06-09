# 📦 StockFlow — Enterprise Order Management System

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker)

**StockFlow** is a production-ready, full-stack application designed for managing products, customers, orders, and inventory movement. Built originally as a technical assessment for Ethara AI, it has been heavily refined to feature an **industry-standard Enterprise OMS Light Theme** optimized for high data density, extreme readability, and transactional safety.

---

## ✨ Key Features

### 💻 Enterprise-Grade UI
- **Data-Dense Layout**: Clean, high-contrast light theme inspired by top-tier tools like Stripe and Shopify Polaris.
- **Tabular Readability**: Utilizes `JetBrains Mono` specifically for SKUs, Prices, and Order IDs to ensure perfect vertical alignment during rapid data entry.
- **Dynamic Feedback**: Real-time notifications, interactive modals, and subtle state transitions without sacrificing performance.

### 🛡️ Robust Backend Logic
- **Transaction-Safe Inventory**: Utilizes database row-locking to ensure stock is reduced safely during concurrent order placements, completely preventing overselling.
- **Strict Validation**: End-to-end type safety and payload validation using Pydantic on the backend.
- **Relational Integrity**: Multi-table architecture enforcing unique constraints on SKUs and Customer Emails.

---

## 🏗️ Architecture & Tech Stack

| Component | Technology Used |
|-----------|-----------------|
| **Frontend** | React 18, Vite, Custom CSS (OMS Theme), Lucide Icons |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | PostgreSQL, SQLAlchemy 2.0 |
| **Containerization**| Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start (Docker)

The entire application is containerized. To spin up the database, backend, and frontend simultaneously, simply run:

```bash
git clone https://github.com/your-username/stockflow.git
cd stockflow
docker compose up --build
```

### Accessing the Services
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Reference

### Products
- `GET /products` - List all products
- `POST /products` - Create a new product (requires unique SKU)
- `PUT /products/{id}` - Update a product
- `DELETE /products/{id}` - Delete a product

### Orders
- `GET /orders` - List all orders
- `POST /orders` - Place a new order (automatically reduces inventory)
- `DELETE /orders/{id}` - Delete an order

### Dashboard
- `GET /dashboard/summary` - Fetch high-level metrics (Total Products, Customers, Orders, Low Stock Alerts)

**Sample Order Payload:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 4,
      "quantity": 2
    }
  ]
}
```

---

## 📈 Future Roadmap

- [ ] **JWT Authentication**: Secure API endpoints and add role-based access control (RBAC).
- [ ] **Alembic Migrations**: Implement schema version control for the PostgreSQL database.
- [ ] **Unit & Integration Testing**: Add `pytest` test coverage for core transactional logic.
- [ ] **Order Cancellations**: Add logic to safely cancel orders and automatically restore inventory stock.

---

*Designed and developed by [Devansh Dixit]*
