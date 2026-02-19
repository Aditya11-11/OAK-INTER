import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Laborer, LaborStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, History } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<LaborStatus, string> = {
  Available: "status-available",
  Scheduled: "status-scheduled",
  Unavailable: "status-unavailable",
};

export default function Labor() {
  const { laborers, isAdmin, addLaborer, updateLaborer, deleteLaborer } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyDialog, setHistoryDialog] = useState<Laborer | null>(null);
  const [editing, setEditing] = useState<Laborer | null>(null);
  const [form, setForm] = useState({
    name: "", skill: "", assignedLocation: "", scheduleStart: "", scheduleEnd: "", status: "Available" as LaborStatus,
  });

  const filtered = laborers.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.skill.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;

    let matchesTime = true;
    if (timeFilter !== "all" && l.created_at) {
      const itemDate = new Date(l.created_at);
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

    return matchesSearch && matchesStatus && matchesTime;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", skill: "", assignedLocation: "", scheduleStart: "", scheduleEnd: "", status: "Available" });
    setDialogOpen(true);
  };

  const openEdit = (l: Laborer) => {
    setEditing(l);
    setForm({ name: l.name, skill: l.skill, assignedLocation: l.assignedLocation, scheduleStart: l.scheduleStart, scheduleEnd: l.scheduleEnd, status: l.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.skill.trim()) { toast.error("Name and skill are required"); return; }
    if (editing) {
      updateLaborer({ ...editing, ...form });
      toast.success("Worker updated");
    } else {
      addLaborer(form);
      toast.success("Worker added");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Labor Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{laborers.length} registered workers</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Worker</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editing ? "Edit Worker" : "Add Worker"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Skill</Label><Input value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} /></div>
                <div><Label>Assigned Location</Label><Input value={form.assignedLocation} onChange={(e) => setForm({ ...form, assignedLocation: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Schedule Start</Label><Input type="date" value={form.scheduleStart} onChange={(e) => setForm({ ...form, scheduleStart: e.target.value })} /></div>
                  <div><Label>Schedule End</Label><Input type="date" value={form.scheduleEnd} onChange={(e) => setForm({ ...form, scheduleEnd: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LaborStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Worker</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Skill</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="min-w-[180px]">Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setHistoryDialog(l)}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.skill}</TableCell>
                  <TableCell>{l.assignedLocation || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {l.scheduleStart && l.scheduleEnd ? `${l.scheduleStart} → ${l.scheduleEnd}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[l.status]} text-xs`}>{l.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => setHistoryDialog(l)}><History className="h-4 w-4" /></Button>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { deleteLaborer(l.id); toast.success("Worker removed"); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No workers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Worker History Dialog */}
      <Dialog open={!!historyDialog} onOpenChange={() => setHistoryDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{historyDialog?.name} — Work History</DialogTitle>
          </DialogHeader>
          {historyDialog && (
            <div className="space-y-3 pt-2">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong className="text-foreground">Skill:</strong> {historyDialog.skill}</p>
                <p><strong className="text-foreground">Current Status:</strong> <Badge className={`${statusColors[historyDialog.status]} text-xs ml-1`}>{historyDialog.status}</Badge></p>
              </div>
              {historyDialog.history.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No history records</p>
              ) : (
                <div className="space-y-3">
                  {historyDialog.history.map((h) => (
                    <div key={h.id} className="rounded-md border p-3 space-y-1">
                      <p className="text-sm font-medium">{h.location}</p>
                      <p className="text-xs text-muted-foreground">{h.startDate} — {h.endDate}</p>
                      <p className="text-sm">{h.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
