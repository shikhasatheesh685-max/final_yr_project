# Art Gallery Showcase - MERN Stack Project

A full-stack web application for managing an art gallery, built with MongoDB, Express, React, and Node.js.

## Features

### Public Features
- Browse artworks without login
- Filter artworks by category, featured status, and availability
- View detailed artwork information
- Register and login

### Artist Features
- Upload artworks with images
- Manage own artworks (view, edit, delete)
- Track sales and revenue
- View order history for their artworks

### Visitor/Customer Features
- Purchase artworks
- View order history
- Track order status

### Admin Features
- Manage all users (view, change roles, delete)
- Manage all artworks (feature, delete)
- Manage all orders (update status)
- View comprehensive sales reports
- Dashboard with statistics

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Multer for file uploads

### Frontend
- React
- React Router
- Axios for API calls
- Context API for state management
- CSS3

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
```

For local MongoDB:
```
MONGO_URI=mongodb://localhost:27017/art_gallery
```

For MongoDB Atlas, use your connection string.

For JWT_SECRET, use any random string (e.g., `mySecretKey123`).

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the `client` directory:
```
VITE_API_URL=http://localhost:5000/api
```

If not set, it defaults to `http://localhost:5000/api`.

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Creating an Admin Account

To create an admin account, you can either:

1. **Via MongoDB directly:**
   - Register a user through the frontend
   - Connect to MongoDB and update the user's role to 'admin'

2. **Via API (using Postman or similar):**
   - POST to `http://localhost:5000/api/auth/register`
   - Body: `{ "name": "Admin", "email": "admin@example.com", "password": "password123", "role": "admin" }`

## Project Structure

```
art_gallery_showcase/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── upload.js           # Multer file upload configuration
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Artwork.js          # Artwork model
│   │   └── Order.js            # Order model
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── users.js            # User management routes (Admin)
│   │   ├── artworks.js         # Artwork routes
│   │   └── orders.js           # Order routes
│   ├── uploads/                # Uploaded images directory
│   ├── server.js               # Express server setup
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── ErrorMessage.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Authentication context
    │   ├── pages/
    │   │   ├── Home.jsx          # Gallery page
    │   │   ├── ArtworkDetail.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── UserOrders.jsx
    │   │   ├── ArtistDashboard.jsx
    │   │   ├── UploadArtwork.jsx
    │   │   ├── MyArtworks.jsx
    │   │   ├── EditArtwork.jsx
    │   │   ├── ArtistSales.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminUsers.jsx
    │   │   ├── AdminArtworks.jsx
    │   │   ├── AdminOrders.jsx
    │   │   ├── AdminSales.jsx
    │   │   └── NotFound.jsx
    │   ├── utils/
    │   │   └── api.js            # API utility functions
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### Artworks
- `GET /api/artworks` - Get all artworks (Public)
- `GET /api/artworks/:id` - Get single artwork (Public)
- `POST /api/artworks` - Create artwork (Artist/Admin)
- `PUT /api/artworks/:id` - Update artwork (Owner/Admin)
- `DELETE /api/artworks/:id` - Delete artwork (Owner/Admin)
- `GET /api/artworks/artist/:artistId` - Get artworks by artist (Public)
- `GET /api/artworks/categories/list` - Get all categories (Public)

### Orders
- `POST /api/orders` - Create order (Authenticated)
- `GET /api/orders` - Get orders (Own/All for Admin)
- `GET /api/orders/:id` - Get single order (Owner/Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/artist/sales` - Get artist sales (Artist)
- `GET /api/orders/admin/sales-report` - Get sales report (Admin)

## User Roles

- **Visitor**: Can browse and purchase artworks
- **Artist**: Can upload and manage artworks, view sales
- **Admin**: Full access to manage users, artworks, orders, and view reports

## Notes

- Images are stored locally in `server/uploads/` directory
- JWT tokens expire after 30 days
- Password minimum length: 6 characters
- Image upload limit: 5MB
- Supported image formats: JPEG, JPG, PNG, GIF, WEBP

## Development

- Backend: `npm run dev` (uses nodemon for auto-restart)
- Frontend: `npm run dev` (Vite dev server with HMR)

## Production Build

### Frontend
```bash
cd client
npm run build
```

The build output will be in `client/dist/`

### Backend
```bash
cd server
npm start
```

## License

This project is created for educational purposes as a final year project.
