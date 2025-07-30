import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, TrendingUp, TrendingDown, Users, AlertCircle, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ReportStats {
  totalGiven: number;
  totalReceived: number;
  totalDue: number;
  totalCustomers: number;
  customersWithDue: number;
  totalTransactions: number;
  averageTransaction: number;
}

interface CustomerReport {
  id: string;
  name: string;
  phone: string;
  due_amount: number;
  total_given: number;
  total_received: number;
  transaction_count: number;
  last_transaction: string;
}

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats>({
    totalGiven: 0,
    totalReceived: 0,
    totalDue: 0,
    totalCustomers: 0,
    customersWithDue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
  });
  const [customerReports, setCustomerReports] = useState<CustomerReport[]>([]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let dateFilter = "";
      if (dateRange === "custom" && startDate && endDate) {
        dateFilter = `date >= '${startDate}' AND date <= '${endDate}'`;
      } else if (dateRange === "today") {
        const today = new Date().toISOString().split('T')[0];
        dateFilter = `date = '${today}'`;
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        dateFilter = `date >= '${weekAgoStr}'`;
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAgoStr = monthAgo.toISOString().split('T')[0];
        dateFilter = `date >= '${monthAgoStr}'`;
      }

      // Fetch transactions with date filter
      let transactionsQuery = supabase
        .from('transactions')
        .select('*');

      if (dateFilter) {
        transactionsQuery = transactionsQuery.filter(dateFilter);
      }

      const { data: transactions, error: transactionsError } = await transactionsQuery;
      if (transactionsError) throw transactionsError;

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*');
      if (customersError) throw customersError;

      // Calculate stats
      const totalGiven = transactions?.filter(t => t.type === 'given').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalReceived = transactions?.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalDue = customers?.reduce((sum, c) => sum + c.due_amount, 0) || 0;
      const customersWithDue = customers?.filter(c => c.due_amount > 0).length || 0;
      const totalTransactions = transactions?.length || 0;
      const averageTransaction = totalTransactions > 0 ? (totalGiven + totalReceived) / totalTransactions : 0;

      setStats({
        totalGiven,
        totalReceived,
        totalDue,
        totalCustomers: customers?.length || 0,
        customersWithDue,
        totalTransactions,
        averageTransaction,
      });

      // Generate customer reports
      const customerReportsData = customers?.map(customer => {
        const customerTransactions = transactions?.filter(t => t.customer_id === customer.id) || [];
        const totalGiven = customerTransactions.filter(t => t.type === 'given').reduce((sum, t) => sum + t.amount, 0);
        const totalReceived = customerTransactions.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0);
        const lastTransaction = customerTransactions.length > 0 
          ? customerTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
          : customer.created_at;

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          due_amount: customer.due_amount,
          total_given: totalGiven,
          total_received: totalReceived,
          transaction_count: customerTransactions.length,
          last_transaction: lastTransaction,
        };
      }) || [];

      setCustomerReports(customerReportsData.sort((a, b) => Math.abs(b.due_amount) - Math.abs(a.due_amount)));

    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate]);

  const handleDownloadReport = () => {
    const csvContent = [
      ['গ্রাহকের নাম', 'ফোন', 'বাকি টাকা', 'মোট দিলাম', 'মোট পেলাম', 'লেনদেন সংখ্যা', 'সর্বশেষ লেনদেন'],
      ...customerReports.map(customer => [
        customer.name,
        customer.phone || '',
        formatAmount(customer.due_amount),
        formatAmount(customer.total_given),
        formatAmount(customer.total_received),
        customer.transaction_count.toString(),
        formatDate(customer.last_transaction)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `talikhata-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "রিপোর্ট ডাউনলোড হয়েছে",
      description: "রিপোর্ট সফলভাবে ডাউনলোড করা হয়েছে।",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              ফিরে যান
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ব্যবসার রিপোর্ট</h1>
              <p className="text-muted-foreground">আপনার ব্যবসার সম্পূর্ণ হিসাব</p>
            </div>
          </div>
          
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download className="h-4 w-4" />
            রিপোর্ট ডাউনলোড
          </Button>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              তারিখ ফিল্টার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>সময়কাল</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল সময়</SelectItem>
                    <SelectItem value="today">আজ</SelectItem>
                    <SelectItem value="week">গত ৭ দিন</SelectItem>
                    <SelectItem value="month">গত ৩০ দিন</SelectItem>
                    <SelectItem value="custom">কাস্টম</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dateRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label>শুরুর তারিখ</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>শেষের তারিখ</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট দিলাম</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {loading ? "..." : formatAmount(stats.totalGiven)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTransactions} টি লেনদেন
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট পেলাম</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loading ? "..." : formatAmount(stats.totalReceived)}
              </div>
              <p className="text-xs text-muted-foreground">
                গড়: {formatAmount(stats.averageTransaction)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট বাকি</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {loading ? "..." : formatAmount(stats.totalDue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.customersWithDue} জন গ্রাহকের কাছে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট গ্রাহক</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loading ? "..." : stats.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">
                সক্রিয় গ্রাহক
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              গ্রাহক রিপোর্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  লোড হচ্ছে...
                </div>
              </div>
            ) : customerReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>কোনো গ্রাহক নেই</p>
                <p className="text-sm">গ্রাহক যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerReports.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          সর্বশেষ: {formatDate(customer.last_transaction)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        {customer.due_amount > 0 ? (
                          <Badge variant="destructive">
                            বাকি: {formatAmount(customer.due_amount)}
                          </Badge>
                        ) : customer.due_amount < 0 ? (
                          <Badge variant="secondary">
                            দিতে হবে: {formatAmount(customer.due_amount)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">সমান</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="text-warning">দিলাম: {formatAmount(customer.total_given)}</span>
                        {" | "}
                        <span className="text-success">পেলাম: {formatAmount(customer.total_received)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {customer.transaction_count} টি লেনদেন
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports; 