# তালিখাতা ওয়েব (TallyKhata Web)

A comprehensive business ledger application for Bangladeshi shopkeepers, built with React, TypeScript, and Supabase.

## 🌟 Features

- **User Authentication** - Email/password login with Supabase Auth
- **Customer Management** - Add, edit, delete customers with search
- **Transaction Recording** - Track given/received amounts (দিলাম/পেলাম)
- **Business Reports** - Detailed analytics with date filtering
- **Mobile Responsive** - Works perfectly on all devices
- **Bangla Language** - Complete UI in Bengali
- **Real-time Updates** - Live data synchronization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend)

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
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
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
   Add your Supabase environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add your Supabase URL and keys

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema

The app uses Supabase with the following tables:
- `profiles` - User business information
- `customers` - Customer data with balances
- `transactions` - Transaction records

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
├── integrations/   # Supabase integration
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
