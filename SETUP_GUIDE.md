# Quick Setup Guide

## Step 1: Backend Setup

1. Navigate to server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `server` folder:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/art_gallery
JWT_SECRET=your_secret_key_here_12345
```

**For MongoDB Atlas:**
- Replace `MONGO_URI` with your Atlas connection string
- Example: `mongodb+srv://username:password@cluster.mongodb.net/art_gallery`

4. Start MongoDB (if using local):
- Make sure MongoDB is running on your system

5. (Optional) Create admin user:
```bash
npm run seed:admin
```
This creates an admin with:
- Email: `admin@artgallery.com`
- Password: `admin123`

6. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Step 2: Frontend Setup

1. Open a new terminal and navigate to client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env` file in `client` folder:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or another port)

## Step 3: Access the Application

1. Open browser and go to `http://localhost:5173`

2. Login as admin:
   - Email: `admin@artgallery.com`
   - Password: `admin123`

3. Or register a new user:
   - Choose role: Visitor or Artist
   - Fill in the registration form

## Testing the Application

### As Admin:
1. Go to Admin Dashboard
2. Manage users, artworks, and orders
3. View sales reports

### As Artist:
1. Register/Login as Artist
2. Go to Artist Dashboard
3. Upload artworks
4. View sales status

### As Visitor:
1. Register/Login as Visitor
2. Browse artworks
3. Purchase artworks
4. View order history

## Troubleshooting

### Server won't start:
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

### Frontend can't connect to backend:
- Verify backend is running on port 5000
- Check `VITE_API_URL` in client `.env` file
- Check browser console for CORS errors

### Images not loading:
- Make sure `server/uploads` folder exists
- Check image file size (must be < 5MB)
- Verify image format (JPEG, PNG, GIF, WEBP)

### Authentication issues:
- Clear browser localStorage
- Check JWT_SECRET in server `.env`
- Verify token expiration (30 days)

## Creating Admin Manually

If seed script doesn't work, create admin via MongoDB:

1. Connect to MongoDB
2. Go to `art_gallery` database
3. Find `users` collection
4. Insert document:
```json
{
  "name": "Admin",
  "email": "admin@artgallery.com",
  "password": "$2a$10$...", // Use bcrypt hash
  "role": "admin"
}
```

Or use the API:
```bash
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Admin",
  "email": "admin@artgallery.com",
  "password": "admin123",
  "role": "admin"
}
```

## Default Credentials (After Seed)

- **Email:** admin@artgallery.com
- **Password:** admin123
- **Role:** admin

⚠️ **Important:** Change the password after first login!
