# তালিখাতা ওয়েব (TallyKhata Web)

A comprehensive business ledger application for Bangladeshi shopkeepers, built with React, TypeScript, Express, and MongoDB.

## 🌟 Features

- **User Authentication** - Email/password login with JWT (Express + MongoDB) and Google Login
- **Customer Management** - Add, edit, delete customers with search
- **Transaction Recording** - Track given/received amounts (দিলাম/পেলাম)
- **Business Reports** - Detailed analytics with date filtering
- **Mobile Responsive** - Works perfectly on all devices
- **Bangla Language** - Complete UI in Bengali
- **Real-time Updates** - RTK Query based reactive updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas) and Cloudinary account (for image uploads)

### Local Development

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd talikhata-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Express + MongoDB (Mongoose) + JWT Auth
- **State Management**: React Query
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📱 Features Overview

### Dashboard
- Business statistics overview
- Recent transactions
- Customer list with balances
- Quick action buttons

### Customer Management
- Add new customers with name and phone
- Edit customer information
- Delete customers with confirmation
- Search customers by name or phone
- View customer balance status

### Transaction System
- Record given/received amounts
- Add notes and dates
- Automatic balance calculation
- Transaction history per customer

### Reports & Analytics
- Date range filtering
- Business statistics
- Customer-wise reports
- CSV export functionality

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Vite configuration

3. **Environment Variables**
Add your API base URL to the frontend and backend variables to your server host:
- Frontend: set VITE_API_URL to your backend URL
- Backend: set MONGODB_URI, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables

Create a `.env` file for local development:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=721095559149-6elhnfmgsurgjg9p5qtq086vk1sk6iuo.apps.googleusercontent.com
```

Backend `.env` (see `backend/env.example` for more):

```env
GOOGLE_CLIENT_ID=721095559149-6elhnfmgsurgjg9p5qtq086vk1sk6iuo.apps.googleusercontent.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
MAIL_FROM=TallyKhata <your_email@gmail.com>
```

## 📊 Database Models

The app uses MongoDB with the following collections (see `backend/models`):
- `User` - User account
- `Customer` - Customer data with balances
- `Transaction` - Transaction records

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/      # UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── integrations/   # (unused)
└── lib/           # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.
