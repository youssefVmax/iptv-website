@@ .. @@
-// components/add-deal-page.tsx
 "use client";

 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Textarea } from "@/components/ui/textarea";
 import { useToast } from "@/hooks/use-toast";
-import { useRouter } from "next/navigation";
+import { useAuth } from "@/hooks/useAuth";

-export function AddDealPage() {
+export function AddDealPage() {
   const { toast } = useToast();
-  const router = useRouter();
+  const { user } = useAuth();
   const [formData, setFormData] = useState({
     date: new Date().toISOString().split('T')[0],
     customer_name: "",
     phone: "",
     email: "",
     amount: "",
     username: "",
     address: "",
-    sales_agent: "",
-    closing_agent: "",
+    sales_agent: user?.name || "",
+    closing_agent: user?.name || "",
     team: "CS TEAM",
     duration: "TWO YEAR",
     type_program: "IBO PLAYER",
     type_service: "SLIVER",
     invoice: "",
     device_id: "",
     device_key: "",
     comment: "",
     no_user: "1",
   });

   const [loading, setLoading] = useState(false);
@@ .. @@
       // Generate agent IDs based on names
       const generateId = (prefix: string) => {
         const randomString = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36).substring(2, 10);
         return `${prefix}-${randomString}`
       }

       const newDeal = {
         ...formData,
         date: new Date().toISOString().split('T')[0],
         amount: parseFloat(formData.amount) || 0,
         no_user: parseInt(formData.no_user) || 1,
         DealID: dealId,
-        SalesAgentID: generateId('agent'),
-        ClosingAgentID: generateId('agent'),
+        SalesAgentID: user?.id || generateId('agent'),
+        ClosingAgentID: user?.id || generateId('agent'),
         sales_agent_norm: formData.sales_agent.toLowerCase(),
         closing_agent_norm: formData.closing_agent.toLowerCase(),
       };

       // Here you would typically send the data to your API
       console.log('New Deal:', newDeal);
       
       // Show success message
       toast({
         title: "Deal added successfully!",
         description: `Deal ID: ${dealId} has been created.`,
-        title: "Deal Added Successfully",
-        description: `Deal ${dealId} has been created and assigned.`,
       });

-      // Create notification for CS team
-      const csNotification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
-        title: 'New Deal Requires Attention',
-        message: `New deal ${dealId} for ${formData.customer_name} requires CS team action.`,
-        type: 'deal',
-        priority: 'high',
-        from: user.name,
-        to: ['CS TEAM'],
-        dealId,
-        dealName: formData.customer_name,
-        dealValue: parseFloat(formData.amount),
-        dealStage: 'new',
-        actionRequired: true,
-      };
-      addNotification(csNotification);
-
-      // If user is not a manager, also notify managers
-      if (userRole !== 'manager') {
-        const managerNotification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
-          title: 'New Deal Created',
-          message: `${user.name} created a new deal ${dealId} for ${formData.customer_name}.`,
-          type: 'deal',
-          priority: 'medium',
-          from: user.name,
-          to: ['MANAGER'],
-          dealId,
-          dealName: formData.customer_name,
-          dealValue: parseFloat(formData.amount),
-          dealStage: 'new',
-        };
-        addNotification(managerNotification);
-      }
-
       // Reset form
       setFormData({
         date: new Date().toISOString().split('T')[0],
         customer_name: "",
         phone: "",
         email: "",
         amount: "",
         username: "",
         address: "",
-        sales_agent: user.name,
-        closing_agent: user.name,
+        sales_agent: user?.name || "",
+        closing_agent: user?.name || "",
         team: "CS TEAM",
         duration: "TWO YEAR",
         type_program: "IBO PLAYER",
         type_service: "SLIVER",
         invoice: "",
         device_id: "",
         device_key: "",
         comment: "",
         no_user: "1",
       });

-      // Call the onDealAdded callback to refresh the deals list
-      onDealAdded();
     } catch (error) {
       console.error('Error adding deal:', error);

-      // Create error notification
-      const errorNotification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
-        title: 'Failed to Add Deal',
-        message: `Failed to add deal for ${formData.customer_name}. Please try again.`,
-        type: 'error',
-        priority: 'high',
-        from: 'System',
-        to: [userRole === 'manager' ? 'MANAGER' : user.name],
-      };
-      addNotification(errorNotification);
-
       toast({
         title: "Error",
         description: "Failed to add deal. Please try again.",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
@@ .. @@
                 <Input
                   id="sales_agent"
                   name="sales_agent"
                   value={formData.sales_agent}
                   onChange={handleChange}
                   required
-                  disabled={userRole === "salesman"}
+                  disabled={user?.role === "salesman"}
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="closing_agent">Closing Agent *</Label>
                 <Input
                   id="closing_agent"
                   name="closing_agent"
                   value={formData.closing_agent}
                   onChange={handleChange}
                   required
-                  disabled={userRole === "salesman"}
+                  disabled={user?.role === "salesman"}
                 />
               </div>