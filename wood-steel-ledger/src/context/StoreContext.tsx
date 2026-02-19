import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { InventoryItem, Order, Laborer, Expense } from "@/types";
import api from "@/lib/api";
import { toast } from "sonner";

interface StoreContextType {
  inventory: InventoryItem[];
  orders: Order[];
  laborers: Laborer[];
  expenses: Expense[];
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  addOrder: (order: Omit<Order, "id">) => void;
  addLaborer: (laborer: Omit<Laborer, "id" | "history">) => void;
  updateLaborer: (laborer: Laborer) => void;
  deleteLaborer: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  getTodaySales: () => number;
  getTodayExpenses: () => number;
  getTotalStock: () => number;
  getItemsSoldToday: () => number;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

const today = () => new Date().toISOString().split("T")[0];

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAdmin, setIsAdmin] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [invRes, ordRes, labRes, expRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/orders"),
        api.get("/laborers"),
        api.get("/expenses"),
      ]);

      setInventory(invRes.data);
      setOrders(ordRes.data);
      setLaborers(labRes.data);
      setExpenses(expRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, "id">) => {
    try {
      await api.post("/inventory", item);
      refreshData();
    } catch (error) {
      toast.error("Failed to add inventory item");
    }
  }, [refreshData]);

  const updateInventoryItem = useCallback(async (item: InventoryItem) => {
    try {
      await api.put(`/inventory/${item.id}`, item);
      refreshData();
    } catch (error) {
      toast.error("Failed to update inventory item");
    }
  }, [refreshData]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      refreshData();
    } catch (error) {
      toast.error("Failed to delete inventory item");
    }
  }, [refreshData]);

  const addOrder = useCallback(async (order: Omit<Order, "id">) => {
    try {
      await api.post("/orders", order);
      refreshData();
    } catch (error) {
      toast.error("Failed to process order");
    }
  }, [refreshData]);

  const addLaborer = useCallback(async (laborer: Omit<Laborer, "id" | "history">) => {
    try {
      await api.post("/laborers", laborer);
      refreshData();
    } catch (error) {
      toast.error("Failed to add laborer");
    }
  }, [refreshData]);

  const updateLaborer = useCallback(async (laborer: Laborer) => {
    try {
      await api.put(`/laborers/${laborer.id}`, laborer);
      refreshData();
    } catch (error) {
      toast.error("Failed to update laborer");
    }
  }, [refreshData]);

  const deleteLaborer = useCallback(async (id: string) => {
    try {
      await api.delete(`/laborers/${id}`);
      refreshData();
    } catch (error) {
      toast.error("Failed to delete laborer");
    }
  }, [refreshData]);

  const addExpense = useCallback(async (expense: Omit<Expense, "id">) => {
    try {
      await api.post("/expenses", expense);
      refreshData();
    } catch (error) {
      toast.error("Failed to add expense");
    }
  }, [refreshData]);

  const getTodaySales = useCallback(() => {
    const t = today();
    return orders.filter((o) => o.type === "sale" && o.date === t).reduce((sum, o) => sum + o.totalPrice, 0);
  }, [orders]);

  const getTodayExpenses = useCallback(() => {
    const t = today();
    return expenses.filter((e) => e.date === t).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getTotalStock = useCallback(() => {
    return inventory.reduce((sum, i) => sum + i.stock, 0);
  }, [inventory]);

  const getItemsSoldToday = useCallback(() => {
    const t = today();
    return orders.filter((o) => o.type === "sale" && o.date === t).reduce((sum, o) => sum + o.quantity, 0);
  }, [orders]);

  return (
    <StoreContext.Provider
      value={{
        inventory, orders, laborers, expenses, isAdmin, setIsAdmin,
        addInventoryItem, updateInventoryItem, deleteInventoryItem,
        addOrder, addLaborer, updateLaborer, deleteLaborer, addExpense,
        getTodaySales, getTodayExpenses, getTotalStock, getItemsSoldToday,
        refreshData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

