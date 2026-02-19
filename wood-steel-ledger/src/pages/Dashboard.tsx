import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, FileDown } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { getTotalStock, getItemsSoldToday, getTodaySales, getTodayExpenses, inventory } = useStore();
  const [reportModal, setReportModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    category: "All",
    duration: "today",
    startDate: "",
    endDate: ""
  });

  const totalStock = getTotalStock();
  const itemsSold = getItemsSoldToday();
  const todaySales = getTodaySales();
  const todayExpenses = getTodayExpenses();
  const netProfit = todaySales - todayExpenses;
  const lowStockItems = inventory.filter((i) => i.stock < 5);

  const stats = [
    { label: "Total Items in Stock", value: totalStock.toLocaleString(), icon: Package, color: "text-primary" },
    { label: "Items Sold Today", value: itemsSold.toString(), icon: ShoppingCart, color: "text-secondary" },
    { label: "Daily Expenses", value: `₦${todayExpenses.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
    { label: "Net Profit", value: `₦${netProfit.toLocaleString()}`, icon: TrendingUp, color: netProfit >= 0 ? "text-success" : "text-destructive" },
  ];

  const handleExport = async () => {
    try {
      const response = await api.post("/reports/export", reportConfig, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportConfig.category}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      toast.success("Report downloaded successfully");
      setReportModal(false);
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Today's overview of your store operations</p>
        </div>

        <Dialog open={reportModal} onOpenChange={setReportModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Get Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Excel Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Report For</Label>
                <Select value={reportConfig.category} onValueChange={(v) => setReportConfig({ ...reportConfig, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Inventory</SelectItem>
                    <SelectItem value="Paint">Paint</SelectItem>
                    <SelectItem value="Workers">Workers</SelectItem>
                    <SelectItem value="Hardware/Tools">Hardware & Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={reportConfig.duration} onValueChange={(v) => setReportConfig({ ...reportConfig, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reportConfig.duration === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={reportConfig.startDate} onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={reportConfig.endDate} onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })} />
                  </div>
                </div>
              )}
              <Button onClick={handleExport} className="w-full mt-4">Confirm & Download</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-stat">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive text-base font-body">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-destructive/20 bg-card p-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <span className="text-low-stock text-lg">{item.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
