<p align="center">
  <h1 align="center">🚗 DriveBidRent</h1>
  <p align="center">
    <strong>A full-stack vehicle auction &amp; rental marketplace</strong>
  </p>
  <p align="center">
    <a href="https://drive-bid-rent-sepia.vercel.app/">Live Demo</a> ·
    <a href="#features">Features</a> ·
    <a href="#tech-stack">Tech Stack</a> ·
    <a href="#getting-started">Getting Started</a>
  </p>
</p>

<br/>

## 📋 Overview

**DriveBidRent** is a comprehensive vehicle marketplace platform that combines **live car auctions**, **vehicle rentals**, and **mechanic inspections** into a single, unified application. The platform supports six distinct user roles — Buyers, Sellers, Auction Managers, Mechanics, Admins, and Super Admins — each with dedicated dashboards, workflows, and real-time communication capabilities.

> **Live URL:** [https://drive-bid-rent-sepia.vercel.app](https://drive-bid-rent-sepia.vercel.app/)

---

## ✨ Features

### 🏷️ Auction System
- **Live Auction Rooms** with real-time bidding via WebSockets (Socket.IO)
- Auction listing with advanced search & filters (condition, fuel type, transmission, price range)
- Bid tracking, bid history, and automatic highest-bid detection
- Auction scheduling with start/end date management
- Wishlist support for auctions and rentals

### 🚘 Rental Marketplace
- Vehicle rental listings with detailed specifications
- Booking system with rental cost calculations
- Rental reviews and ratings
- Seller earnings tracking

### 🔧 Mechanic Inspection Workflow
- Auction Managers assign mechanics for vehicle inspections
- Mechanics submit detailed inspection reports
- Dedicated inspection chat between mechanic and auction manager
- Task management dashboard (pending, current, past tasks)

### 💬 Real-Time Communication
- In-app chat system between buyers and sellers
- Inspection chat between mechanics and auction managers
- Real-time notifications across all user roles
- Socket.IO powered live updates

### 💳 Payments
- Stripe integration for secure payment processing
- Payment success/cancel flow handling
- Purchase history and receipts

### 🔐 Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Google OAuth integration
- OTP-based verification via email (Nodemailer)
- Role-based access control with dedicated middleware per role

### 📊 Admin & Super Admin
- **Admin Dashboard:** Manage users, auction managers, earnings, and analytics
- **Super Admin Dashboard:** Platform-wide analytics, revenue tracking, trends, and user activity monitoring
- User approval workflows
- Block/unblock user management

### 🛡️ Security
- Helmet.js for HTTP security headers
- Rate limiting with express-rate-limit
- CORS configuration
- Input validation with express-validator
- Centralized error handling middleware

---

## 🏗️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 7** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Redux Toolkit** | Global state management |
| **Tailwind CSS** (CDN) | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Axios** | HTTP client |
| **Chart.js / Recharts** | Data visualization & analytics |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Stripe.js** | Payment integration |
| **React Calendar** | Date picker component |
| **Splide.js** | Image carousels |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **Socket.IO** | Real-time bidirectional communication |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Cloudinary** | Image upload & storage |
| **Multer** | File upload middleware |
| **Stripe** | Payment processing |
| **Nodemailer** | Email notifications & OTP |
| **Redis / Upstash Redis** | Caching layer |
| **PDFKit** | PDF report generation |
| **Swagger** | API documentation |
| **Morgan** | HTTP request logging |
| **Helmet** | Security headers |
| **express-rate-limit** | API rate limiting |
| **express-validator** | Input validation |
| **compression** | Response compression |

### Testing

| Technology | Purpose |
|---|---|
| **Jest** | Backend unit & integration testing |
| **Supertest** | HTTP assertion library |
| **MongoDB Memory Server** | In-memory DB for tests |
| **Vitest** | Frontend unit testing |
| **React Testing Library** | Component testing |

### DevOps & Deployment

| Technology | Purpose |
|---|---|
| **Vercel** | Frontend hosting & CI/CD |
| **Render** | Backend hosting |
| **Docker & Docker Compose** | Containerization |
| **Nginx** | Reverse proxy (Docker setup) |
| **GitHub** | Version control |

---

## 📁 Project Structure

```
DriveBidRent/
├── Backend/
│   ├── app.js                    # Express server entry point
│   ├── config/                   # Database & service configurations
│   ├── controllers/              # Route handlers
│   │   ├── auth.controller.js    # Authentication (login, signup, OAuth)
│   │   ├── chat.controller.js    # Chat system
│   │   ├── buyer/                # Buyer-specific controllers
│   │   ├── sellerControllers/    # Seller-specific controllers
│   │   ├── mechanic/             # Mechanic-specific controllers
│   │   ├── adminControllers/     # Admin controllers
│   │   ├── superAdminControllers/# Super admin controllers
│   │   └── auctionManager/       # Auction manager controllers
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js               # User model (buyer/seller/mechanic)
│   │   ├── AuctionRequest.js     # Auction listings
│   │   ├── AuctionBid.js         # Bid records
│   │   ├── RentalRequest.js      # Rental listings
│   │   ├── Chat.js / Message.js  # Chat system models
│   │   ├── InspectionReport.js   # Mechanic inspection reports
│   │   ├── Purchase.js           # Purchase records
│   │   └── Notification.js       # In-app notifications
│   ├── middlewares/              # Auth, role-based, security middleware
│   ├── routes/                   # API route definitions
│   ├── sockets/                  # Socket.IO event handlers
│   ├── utils/                    # Helper utilities
│   ├── docs/swagger/             # Swagger API documentation
│   ├── tests/                    # Jest test suites
│   ├── Dockerfile                # Backend Docker config
│   └── package.json
│
├── client/
│   ├── index.html                # SPA entry point
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/             # HomePage, Login, Signup
│   │   │   ├── buyer/            # Auctions, Bids, Rentals, Chat, Wishlist
│   │   │   ├── seller/           # Add/View Auctions & Rentals, Earnings
│   │   │   ├── mechanic/         # Dashboard, Tasks, Inspection Chat
│   │   │   ├── admin/            # Manage Users, Earnings, Analytics
│   │   │   ├── superadmin/       # Analytics, Revenue, Trends, Activities
│   │   │   ├── auctionManager/   # Pending/Approved Cars, Assign Mechanic
│   │   │   └── components/       # Shared components
│   │   ├── redux/                # Redux store & slices
│   │   ├── services/             # API service layer (Axios)
│   │   └── utils/                # Utility functions
│   ├── Dockerfile                # Client Docker config
│   ├── vite.config.js            # Vite configuration
│   └── package.json
│
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Buyer** | Browse auctions & rentals, place bids, join live auction rooms, book rentals, manage wishlist, chat with sellers, make payments |
| **Seller** | List vehicles for auction or rental, manage listings, view bids & earnings, chat with buyers |
| **Auction Manager** | Review pending car submissions, approve/reject listings, assign mechanics for inspection, manage auction lifecycle |
| **Mechanic** | Receive inspection assignments, inspect vehicles, submit detailed reports, chat with auction managers |
| **Admin** | Manage users & auction managers, view platform earnings, access analytics dashboard |
| **Super Admin** | Full platform oversight — analytics, revenue tracking, trend analysis, user activity monitoring |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (local or Atlas)
- **Redis** (optional, for caching — or use Upstash)

### Environment Variables

#### Backend (`Backend/.env`)

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/drivebidrent
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

GOOGLE_CLIENT_ID=your_google_client_id

REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Client (`client/.env`)

```env
VITE_BACKEND_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Installation

```bash
# Clone the repository
git clone https://github.com/JeevanVankadara/DriveBidRent.git
cd DriveBidRent/React_DriveBidRent_2

# Install backend dependencies
cd Backend
npm install

# Install client dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Terminal 1 — Start the backend
cd Backend
npm run dev        # Starts on http://localhost:8000

# Terminal 2 — Start the frontend
cd client
npm run dev        # Starts on http://localhost:5173
```

### Running with Docker

```bash
# From the project root (React_DriveBidRent_2/)
docker-compose up --build
```

This starts three containers:
- **Backend** on port `8000`
- **Client** (Nginx) on port `80`
- **Redis** on port `6379`

---

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Run all tests
npm test

# Run all tests with HTML report
npm run test:all:report

# View test report
# Navigate to http://localhost:8000/test-reports
```

### Frontend Tests

```bash
cd client

# Run all tests
npm test
```

---

## 📡 API Documentation

Swagger API docs are available at:

```
http://localhost:8000/api-docs
```

### Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/buyer/auctions` | List all auctions (with filters) |
| `GET` | `/api/buyer/auctions/:id` | Get auction details |
| `POST` | `/api/buyer/auctions/:id/bid` | Place a bid |
| `GET` | `/api/buyer/rentals` | List all rentals |
| `POST` | `/api/seller/add-auction` | Create a new auction listing |
| `POST` | `/api/seller/add-rental` | Create a new rental listing |
| `GET` | `/api/mechanic/tasks` | Get mechanic tasks |
| `POST` | `/api/mechanic/inspection-report` | Submit inspection report |
| `GET` | `/api/admin/users` | Manage platform users |
| `GET` | `/api/superadmin/analytics` | Platform analytics |

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | [drive-bid-rent-sepia.vercel.app](https://drive-bid-rent-sepia.vercel.app/) |
| **Backend** | Render | Deployed on Render |
| **Database** | MongoDB Atlas | Cloud-hosted |
| **File Storage** | Cloudinary | Image CDN |
| **Caching** | Upstash Redis | Serverless Redis |

---

## 📄 License

This project is for educational purposes.

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>
