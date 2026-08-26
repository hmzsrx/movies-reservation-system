# CineReserve - Movie Reservation Frontend

This is the Next.js frontend for the Movie Reservation System. It features a premium, animated, and responsive user interface built using Tailwind CSS and Framer Motion.

## 🚀 Getting Started

Follow these steps to run the frontend application locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- The FastAPI Backend should be running (default `http://localhost:8000`)

### Installation & Setup

1. **Navigate to the frontend directory** (if you haven't already):
   ```bash
   cd frontend
   ```

2. **Install all dependencies** (This will install Next.js, React, Tailwind CSS, Autoprefixer, etc.):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and visit:
   [http://localhost:3000](http://localhost:3000)

## 🎨 Features & Pages

- **Home Page** (`/`): A visually stunning landing page with glassmorphism and animations.
- **Movies List** (`/movies`): Displays all currently showing movies fetched from the backend.
- **Movie Details** (`/movies/[id]`): Shows movie information and available showtimes.
- **Seat Booking** (`/book/[showtime_id]`): An interactive visual seat map where users can select and book their preferred seats. Total price calculation and booking confirmation is built-in.
- **Authentication**: Fully integrated Login (`/login`) and Register (`/register`) pages using JWT tokens from the backend API.

## 🔗 Environment Variables
By default, the app expects the backend API to be running on `http://localhost:8000/api/v1`. 
If your backend is running elsewhere, create a `.env.local` file in the `frontend` directory and add:
```
NEXT_PUBLIC_API_URL=http://your-backend-url/api/v1
```

Enjoy building and exploring the CineReserve platform!
