import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  FileText,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "@/hooks/useCustomers";
import { useState } from "react";
import CustomerForm from "../CustomerForm";
const QuickActionButtons = () => {
  const navigate = useNavigate();

  const [showAddDialog, setShowAddDialog] = useState(false);
 
 const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const { refetch } = useCustomers();


  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
  };

  const handleCustomerSuccess = () => {
    setShowAddDialog(false);
    setEditingCustomer(null);
    refetch();
  };

  const actions = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "পেয়েছি",
      description: "টাকা পেয়েছি",
      variant: "default" as const,
      color: "success",
      onClick: () => navigate("/customers"),
    },
    {
      icon: <TrendingDown className="h-5 w-5" />,
      label: "দিয়েছি",
      description: "টাকা দিয়েছি",
      variant: "secondary" as const,
      color: "warning",
      onClick: () => navigate("/customers"),
    },
    {
      icon: <Plus className="h-5 w-5" />,
      label: "নতুন গ্রাহক",
      description: "গ্রাহক যোগ করুন",
      variant: "outline" as const,
      color: "primary",
      onClick:() => setShowAddDialog(true),
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "রিমাইন্ডার",
      description: "এসএমএস পাঠান",
      variant: "outline" as const,
      color: "accent",
      onClick: () => navigate("/customers"),
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "রিপোর্ট",
      description: "হিসাব দেখুন",
      variant: "outline" as const,
      color: "muted",
      onClick: () => navigate("/reports"),
    },
    // {
    //   icon: <QrCode className="h-5 w-5" />,
    //   label: "QR কোড",
    //   description: "পেমেন্ট নিন",
    //   variant: "outline" as const,
    //   color: "primary",
    //   onClick: () => {
    //     // TODO: Implement QR code functionality
    //     console.log("QR Code feature coming soon!");
    //   }
    // }
  ];

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={action.onClick}
              >
                <div
                  className={`h-10 w-10 rounded-full bg-${action.color}/10 flex items-center justify-center text-${action.color}`}
                >
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs opacity-70">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Customer Form Dialogs */}
      <CustomerForm
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleCustomerSuccess}
        mode="add"
      />
          <CustomerForm
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSuccess={handleCustomerSuccess}
        mode="edit"
      />
    </>
  );
};

export default QuickActionButtons;
