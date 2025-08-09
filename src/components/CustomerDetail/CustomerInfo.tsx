import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User } from "lucide-react";
import { Customer } from "@/types";

interface CustomerInfoProps {
  customer: Customer;
}

const CustomerInfo = ({ customer }: CustomerInfoProps) => {
  if (!customer.address && !customer.description) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>গ্রাহকের তথ্য</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer.address && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">ঠিকানা:</span>
            </div>
            <p className="text-muted-foreground pl-6">{customer.address}</p>
          </div>
        )}
        {customer.description && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">বিবরণ:</span>
            </div>
            <p className="text-muted-foreground pl-6">{customer.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerInfo;
