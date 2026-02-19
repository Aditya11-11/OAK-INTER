import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function Financials() {
  const { expenses, orders, addExpense, getTodaySales, getTodayExpenses } = useStore();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const [timeFilter, setTimeFilter] = useState<string>("today");

  const todaySales = getTodaySales();
  const todayExpenses = getTodayExpenses();
  const profit = todaySales - todayExpenses;
  const today = new Date().toISOString().split("T")[0];

  const filteredOrders = orders.filter((o) => {
    if (o.type !== "sale") return false;
    if (timeFilter === "today") return o.date === today;

    const oDate = new Date(o.date);
    const now = new Date();
    if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return oDate >= weekAgo;
    } else if (timeFilter === "month") {
      return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
    } else if (timeFilter === "year") {
      return oDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const filteredExpensesList = expenses.filter((e) => {
    if (timeFilter === "today") return e.date === today;

    const eDate = new Date(e.date);
    const now = new Date();
    if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return eDate >= weekAgo;
    } else if (timeFilter === "month") {
      return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
    } else if (timeFilter === "year") {
      return eDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const handleAdd = () => {
    if (!desc.trim() || !amount) { toast.error("Fill in all fields"); return; }
    addExpense({ description: desc.trim(), amount: Number(amount), date: today });
    toast.success("Expense added");
    setDesc("");
    setAmount("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Financials</h1>
          <p className="text-muted-foreground text-sm mt-1">Daily income, expenses, and profit</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="View Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-stat">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted-foreground">Today's Sales</CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold text-success">₦{todaySales.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="card-stat">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted-foreground">Today's Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold text-destructive">₦{todayExpenses.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="card-stat">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted-foreground">Net Profit</CardTitle>
            <DollarSign className={`h-5 w-5 ${profit >= 0 ? "text-success" : "text-destructive"}`} />
          </CardHeader>
          <CardContent><div className={`text-2xl font-display font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>₦{profit.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Add Expense</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1"><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Transport" /></div>
            <div className="w-full sm:w-40"><Label>Amount (₦)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={handleAdd}>Add</Button></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-display font-semibold text-lg mb-3">Sales ({timeFilter})</h3>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead className="min-w-[150px]">Item</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right min-w-[100px]">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => (
                    <TableRow key={o.id}><TableCell>{o.itemName}</TableCell><TableCell className="text-right">{o.quantity}</TableCell><TableCell className="text-right">₦{o.totalPrice.toLocaleString()}</TableCell></TableRow>
                  ))}
                  {filteredOrders.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No sales in this period</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-3">Expenses ({timeFilter})</h3>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead className="min-w-[150px]">Description</TableHead><TableHead className="text-right min-w-[100px]">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredExpensesList.map((e) => (
                    <TableRow key={e.id}><TableCell>{e.description}</TableCell><TableCell className="text-right">₦{e.amount.toLocaleString()}</TableCell></TableRow>
                  ))}
                  {filteredExpensesList.length === 0 && <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No expenses in this period</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
