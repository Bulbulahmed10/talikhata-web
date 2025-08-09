import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Phone, Mail, User, Edit, Send } from "lucide-react";
import { Customer } from "@/types";
import { getInitials } from "@/utils/formatters";

interface CustomerHeaderProps {
  customer: Customer;
  onEdit: () => void;
  onAddTransaction: () => void;
  onSendReminder: () => void;
}

const CustomerHeader = ({ customer, onEdit, onAddTransaction, onSendReminder }: CustomerHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={customer.photo_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {customer.photo_url ? <User className="h-8 w-8" /> : getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
          <div className="space-y-1">
            {customer.phone && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          সম্পাদনা করুন
        </Button>
        {customer.due_amount > 0 && customer.phone && (
          <Button variant="outline" onClick={onSendReminder}>
            <Send className="h-4 w-4 mr-2" />
            রিমাইন্ডার পাঠান
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={onAddTransaction}>
              <Plus className="h-4 w-4" />
              নতুন লেনদেন
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerHeader;
