import { useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Printer } from "lucide-react";
import { toast } from "sonner";

export default function Orders() {
  const { orders, inventory, addOrder, isAdmin } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [form, setForm] = useState({ type: "sale" as "sale" | "restock", itemId: "", quantity: 1 });
  const [receiptOrder, setReceiptOrder] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filtered = orders.filter((o) => typeFilter === "all" || o.type === typeFilter);

  const handleSubmit = () => {
    const item = inventory.find((i) => i.id === form.itemId);
    if (!item) { toast.error("Select an item"); return; }
    if (form.quantity < 1) { toast.error("Quantity must be at least 1"); return; }
    if (form.type === "sale" && form.quantity > item.stock) { toast.error("Insufficient stock"); return; }
    addOrder({
      type: form.type,
      itemId: item.id,
      itemName: item.name,
      quantity: form.quantity,
      totalPrice: form.quantity * item.unitPrice,
      date: new Date().toISOString().split("T")[0],
    });
    toast.success(form.type === "sale" ? "Sale recorded" : "Stock restocked");
    setDialogOpen(false);
    setForm({ type: "sale", itemId: "", quantity: 1 });
  };

  const handlePrint = (orderId: string) => {
    setReceiptOrder(orderId);
    setTimeout(() => window.print(), 200);
  };

  const receiptOrderData = receiptOrder ? orders.find((o) => o.id === receiptOrder) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Order Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">Log incoming stock and sales</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Create Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "sale" | "restock" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="restock">Restock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Item</Label>
                  <Select value={form.itemId} onValueChange={(v) => setForm({ ...form, itemId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>
                      {inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Quantity</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                {form.itemId && (
                  <p className="text-sm text-muted-foreground">
                    Total: ₦{((inventory.find((i) => i.id === form.itemId)?.unitPrice || 0) * form.quantity).toLocaleString()}
                  </p>
                )}
                <Button onClick={handleSubmit} className="w-full">Submit Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="no-print">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="sale">Sales</SelectItem>
            <SelectItem value="restock">Restocks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden no-print">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="min-w-[150px]">Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right min-w-[100px]">Total</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={order.type === "sale" ? "default" : "secondary"}>
                      {order.type === "sale" ? "Sale" : "Restock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{order.itemName}</TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">₦{order.totalPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handlePrint(order.id)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Print receipt */}
      {receiptOrderData && (
        <div ref={receiptRef} className="hidden print:block p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-bold">Oak Woods & Interiors</h2>
            <p className="text-sm">Receipt</p>
          </div>
          <div className="border-t border-b py-4 space-y-2 text-sm">
            <p><strong>Date:</strong> {receiptOrderData.date}</p>
            <p><strong>Type:</strong> {receiptOrderData.type === "sale" ? "Sale" : "Restock"}</p>
            <p><strong>Item:</strong> {receiptOrderData.itemName}</p>
            <p><strong>Quantity:</strong> {receiptOrderData.quantity}</p>
            <p><strong>Total:</strong> ₦{receiptOrderData.totalPrice.toLocaleString()}</p>
          </div>
          <p className="text-xs text-center mt-6">Thank you for your patronage!</p>
        </div>
      )}
    </div>
  );
}
