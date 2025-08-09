import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, Users, AlertCircle, Calendar, FileText } from "lucide-react";
import { customersApi, transactionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ReportStats {
  netReceivable: number;
  netPayable: number;
  totalCustomers: number;
  customersWithDue: number;
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
  const { user, loading: authLoading } = useAuth();
  
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats>({
    netReceivable: 0,
    netPayable: 0,
    totalCustomers: 0,
    customersWithDue: 0,
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

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch customers
      const customersRes = await customersApi.list({ limit: 1000 });
      const customers = customersRes.data || [];

      // Compute stats
      const netReceivable = customers
        .filter(c => Number(c.due_amount) > 0)
        .reduce((sum, c) => sum + Number(c.due_amount), 0);
      const netPayable = customers
        .filter(c => Number(c.due_amount) < 0)
        .reduce((sum, c) => sum + Math.abs(Number(c.due_amount)), 0);
      const customersWithDue = customers.filter(c => Number(c.due_amount) > 0).length;

      setStats({
        netReceivable,
        netPayable,
        totalCustomers: customers.length,
        customersWithDue,
      });

      // Fetch transactions
      const transactionsRes = await transactionsApi.list({ limit: 5000 });
      const transactions = transactionsRes.data || [];

      // Build reports per customer
      const reports: CustomerReport[] = customers.map((customer) => {
        const customerTransactions = transactions.filter(t => {
          const customerId = typeof t.customer === 'string' ? t.customer : (t.customer as any)._id;
          return customerId === (customer as any)._id;
        });
        const totalGiven = customerTransactions
          .filter(t => t.type === 'given')
          .reduce((sum, t) => sum + (t.amount || 0) - (t.refund_amount || 0), 0);
        const totalReceived = customerTransactions
          .filter(t => t.type === 'received')
          .reduce((sum, t) => sum + (t.amount || 0) - (t.refund_amount || 0), 0);
        const lastTransaction = customerTransactions.length > 0
          ? customerTransactions
              .slice()
              .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())[0]
          : null;

        return {
          id: (customer as any)._id,
          name: (customer as any).name,
          phone: ((customer as any).phone as string) || '',
          due_amount: (customer as any).due_amount || 0,
          total_given: totalGiven,
          total_received: totalReceived,
          transaction_count: customerTransactions.length,
          last_transaction: lastTransaction ? `${lastTransaction.date} ${lastTransaction.time}` : '',
        };
      });

      setCustomerReports(reports);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "ত্রুটি",
        description: "রিপোর্ট ডেটা লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDownloadReport = () => {
    // Create CSV content
    const csvContent = [
      ['গ্রাহকের নাম', 'ফোন নম্বর', 'বকেয়া', 'মোট দিলাম', 'মোট পেলাম', 'লেনদেন সংখ্যা', 'সর্বশেষ লেনদেন'],
      ...customerReports.map(report => [
        report.name,
        report.phone,
        formatAmount(report.due_amount),
        formatAmount(report.total_given),
        formatAmount(report.total_received),
        report.transaction_count.toString(),
        report.last_transaction ? formatDate(report.last_transaction) : 'কোনো লেনদেন নেই'
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customer_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "সফল!",
      description: "রিপোর্ট ডাউনলোড হয়েছে।",
    });
  };

  if (authLoading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">রিপোর্ট</h1>
          <p className="text-muted-foreground">আপনার ব্যবসার সম্পূর্ণ রিপোর্ট</p>
        </div>
        
        <Button onClick={handleDownloadReport} className="gap-2">
          <Download className="h-4 w-4" />
          রিপোর্ট ডাউনলোড
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পাওনা</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatAmount(stats.netReceivable)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.customersWithDue} জন গ্রাহকের কাছে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট দেনা</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatAmount(stats.netPayable)}</div>
            <p className="text-xs text-muted-foreground">নেট দেনা</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট গ্রাহক</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">সক্রিয় গ্রাহক</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">বকেয়া গ্রাহক</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.customersWithDue}</div>
            <p className="text-xs text-muted-foreground">রিমাইন্ডার প্রয়োজন</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>তারিখের পরিসর</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">পরিসর নির্বাচন করুন</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল সময়</SelectItem>
                  <SelectItem value="today">আজ</SelectItem>
                  <SelectItem value="week">এই সপ্তাহ</SelectItem>
                  <SelectItem value="month">এই মাস</SelectItem>
                  <SelectItem value="custom">কাস্টম</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">শুরুর তারিখ</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">শেষের তারিখ</Label>
                  <Input
                    id="endDate"
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

      {/* Customer Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>গ্রাহক রিপোর্ট</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>রিপোর্ট লোড হচ্ছে...</p>
            </div>
          ) : customerReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>কোনো গ্রাহক নেই</p>
              <p className="text-sm">নতুন গ্রাহক যোগ করুন</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {report.due_amount > 0 ? (
                          <span className="text-success">পাওনা: {formatAmount(report.due_amount)}</span>
                        ) : report.due_amount < 0 ? (
                          <span className="text-warning">দেনা: {formatAmount(Math.abs(report.due_amount))}</span>
                        ) : (
                          <span className="text-muted-foreground">সমান</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.transaction_count} টি লেনদেন
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/customers/${report.id}`)}
                    >
                      বিস্তারিত দেখুন
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;