import Header from "@/components/Layout/Header";
import StatsCard from "@/components/Dashboard/StatsCard";
import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import CustomersList from "@/components/Dashboard/CustomersList";
import QuickActionButtons from "@/components/QuickActions/QuickActionButtons";
import { TrendingUp, TrendingDown, Users, AlertCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-4 lg:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">স্বাগতম তালিখাতায়</h1>
          <p className="text-muted-foreground">আপনার ব্যবসার সম্পূর্ণ হিসাব একটি জায়গায়</p>
        </div>

        {/* Quick Actions */}
        <QuickActionButtons />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="মোট পাওনা"
            amount={15000}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            subtitle="৮ জন গ্রাহকের কাছে"
          />
          <StatsCard
            title="মোট দেনা"
            amount={8000}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="warning"
            subtitle="৩ জন গ্রাহকের কাছে"
          />
          <StatsCard
            title="মোট গ্রাহক"
            amount={45}
            icon={<Users className="h-6 w-6" />}
            variant="default"
            subtitle="সক্রিয় গ্রাহক"
          />
          <StatsCard
            title="দেরি পেমেন্ট"
            amount={5}
            icon={<AlertCircle className="h-6 w-6" />}
            variant="destructive"
            subtitle="রিমাইন্ডার প্রয়োজন"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentTransactions />
          <CustomersList />
        </div>
      </main>
    </div>
  );
};

export default Index;
