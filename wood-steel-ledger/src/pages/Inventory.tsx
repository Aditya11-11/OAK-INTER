import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { InventoryItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const { inventory, isAdmin, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ name: "", category: "Hardware" as InventoryItem["category"], stock: 0, unitPrice: 0 });

  const filtered = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "paint-section" ? (item.category === "Paint" || item.category === "Paint Tools") : item.category === categoryFilter);

    let matchesTime = true;
    if (timeFilter !== "all" && item.created_at) {
      const itemDate = new Date(item.created_at);
      const now = new Date();
      if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesTime = itemDate >= weekAgo;
      } else if (timeFilter === "month") {
        matchesTime = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "year") {
        matchesTime = itemDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", category: "Hardware", stock: 0, unitPrice: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category, stock: item.stock, unitPrice: item.unitPrice });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Item name is required"); return; }
    if (editing) {
      updateInventoryItem({ ...editing, ...form });
      toast.success("Item updated");
    } else {
      addInventoryItem(form);
      toast.success("Item added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteInventoryItem(id);
    toast.success("Item removed");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Inventory Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">{inventory.length} items tracked</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editing ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as InventoryItem["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Paint">Paint</SelectItem>
                      <SelectItem value="Paint Tools">Paint Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Stock Qty</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                  <div><Label>Unit Price (₦)</Label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} /></div>
                </div>
                <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Time Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Tools">Tools</SelectItem>
            <SelectItem value="paint-section">🎨 Paint Section (All)</SelectItem>
            <SelectItem value="Paint">Paint</SelectItem>
            <SelectItem value="Paint Tools">Paint Tools</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right min-w-[100px]">Unit Price</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">{item.category}</span>
                  </TableCell>
                  <TableCell className={`text-right ${item.stock < 5 ? "text-low-stock" : ""}`}>
                    {item.stock}
                  </TableCell>
                  <TableCell className="text-right">₦{item.unitPrice.toLocaleString()}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No items found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
