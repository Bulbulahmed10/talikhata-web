import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import CustomersList from "@/components/Dashboard/CustomersList";
import QuickActionButtons from "@/components/QuickActions/QuickActionButtons";
import { TrendingUp, TrendingDown, Users, AlertCircle } from "lucide-react";
import { useGetStatsQuery } from "@/store/api/customerApi";
import { StatCard } from "@/components/common";
import { formatCurrency } from "@/utils/formatters";

const Index = () => {
  const { data: stats, isLoading: loading } = useGetStatsQuery();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">স্বাগতম তালিখাতায়</h1>
        <p className="text-muted-foreground">আপনার ব্যবসার সম্পূর্ণ হিসাব একটি জায়গায়</p>
      </div>

      {/* Quick Actions */}
      <QuickActionButtons />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="মোট পাওনা"
          value={loading ? 0 : stats?.netReceivable || 0}
          icon={TrendingUp}
          description={loading ? "লোড হচ্ছে..." : `${stats?.customersWithDue || 0} জন গ্রাহকের কাছে`}
          showCurrency={true}
          variant="success"
        />
        <StatCard
          title="মোট দেনা"
          value={loading ? 0 : stats?.netPayable || 0}
          icon={TrendingDown}
          description={loading ? "লোড হচ্ছে..." : "নেট দেনা"}
          showCurrency={true}
          variant="warning"
        />
        <StatCard
          title="মোট গ্রাহক"
          value={loading ? 0 : stats?.totalCustomers || 0}
          icon={Users}
          description={loading ? "লোড হচ্ছে..." : "সক্রিয় গ্রাহক"}
          variant="default"
        />
        <StatCard
          title="বকেয়া গ্রাহক"
          value={loading ? 0 : stats?.customersWithDue || 0}
          icon={AlertCircle}
          description={loading ? "লোড হচ্ছে..." : "রিমাইন্ডার প্রয়োজন"}
          variant="danger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <CustomersList />
      </div>
    </div>
  );
};

export default Index;
