# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Backend (server/)
```bash
cd server
npm install              # Install dependencies
npm run dev              # Start dev server with nodemon (port 5000)
npm start                # Start production server
npm run seed:admin       # Create default admin (admin@artgallery.com / admin123)
```

### Frontend (client/)
```bash
cd client
npm install              # Install dependencies
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Production build to dist/
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

### Environment Setup
- **Server**: Create `server/.env` with `PORT`, `MONGO_URI`, `JWT_SECRET`
- **Client**: Optionally create `client/.env` with `VITE_API_URL` (defaults to `http://localhost:5000/api`)

## Architecture

### Monorepo Structure
This is a MERN stack application split into two npm packages:
- `server/` - Express.js backend (CommonJS)
- `client/` - React 19 frontend with Vite (ES modules)

### Backend Architecture

**Entry Point**: `server/server.js` - Sets up Express, CORS, static file serving for `/uploads`, and mounts all route modules.

**Route/API Pattern**:
- Routes in `server/routes/` follow REST conventions
- `/api/items` is aliased to `/api/artworks` for spec compliance
- All routes use `protect` middleware for JWT auth and `authorize(...roles)` for RBAC

**Authentication Flow**:
- JWT tokens in `Authorization: Bearer <token>` header
- `middleware/auth.js` exports: `protect` (verify JWT), `authorize(...roles)` (RBAC), `requireApprovedArtist` (artist approval check)
- Tokens stored in localStorage on client

**Models** (Mongoose schemas in `server/models/`):
- `User` - roles: artist, visitor, admin; `isApproved` flag for artist approval workflow
- `Artwork` - linked to artist via `artistID` ref
- `Order` - status workflow: Pending → Confirmed → Sold
- `Auction`, `Bid` - auction system with base price, duration, bidding
- `Category`, `Setting` - admin-managed site configuration

**File Uploads**: 
- Multer configured in `middleware/upload.js`
- Images stored in `server/uploads/`, served at `/uploads/`
- 5MB limit, JPEG/PNG/GIF/WEBP only

### Frontend Architecture

**State Management**: React Context API via `AuthContext` - provides `user`, `login`, `register`, `logout`, role checks (`isArtist`, `isAdmin`)

**API Layer**: `client/src/utils/api.js` - Axios instance with:
- Auto-attaches Bearer token from localStorage
- Auto-redirects to `/login` on 401 responses
- Exports domain-specific API objects: `authAPI`, `artworksAPI`, `ordersAPI`, `usersAPI`, `auctionsAPI`, etc.

**Route Protection**: `ProtectedRoute` component wraps routes, checks auth state and role via `requiredRole` prop (accepts string or array)

**Page Organization**:
- Public: Home, ArtworkDetail, ArtistProfile, Auctions, Login/Register
- Artist routes (`/artist/*`): Dashboard, UploadArtwork, MyArtworks, EditArtwork, Sales, Auctions
- Admin routes (`/admin/*`): Dashboard, Users, Artworks, Orders, Sales, Categories, SiteContent, Reports
- Admin login is separate at `/admin/login`

### Key Conventions

- Artist accounts require admin approval before uploading (`isApproved` flag + `requireApprovedArtist` middleware)
- Image URLs stored as relative paths (`/uploads/filename.ext`), served by Express static middleware
- Artwork availability (`isAvailable`) auto-updates when sold via order completion
- Order status changes trigger artist transaction records for payout tracking
