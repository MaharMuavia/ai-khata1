import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Transaction } from "@/lib/types";

function normalizeTransactions(rows: any[]): Transaction[] {
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    amount: Number(row.amount),
    item: row.item ?? undefined,
    customerName: row.customer_name ?? undefined,
    status: row.status ?? undefined,
    timestamp:
      typeof row.timestamp === "string"
        ? new Date(row.timestamp).getTime()
        : row.timestamp,
  }));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Failed to load transactions:", error.message);
        setIsLoaded(true);
        return;
      }

      setTransactions(normalizeTransactions(data ?? []));
      setIsLoaded(true);
    };

    fetchTransactions();
  }, []);

  const addTransaction = useCallback(async (t: Transaction) => {
    const { data, error } = (await supabase
      .from("transactions")
      .insert([
        {
          id: t.id,
          category: t.category,
          amount: t.amount,
          item: t.item,
          customer_name: t.customerName,
          status: t.status,
          timestamp: new Date(t.timestamp).toISOString(),
        },
      ])
      .select("*")) as { data: any[] | null; error: any };

    if (error) {
      console.error("Failed to add transaction:", error.message);
      throw error;
    }

    if (data?.length) {
      setTransactions((prev) => [normalizeTransactions(data)[0], ...prev]);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const payload: any = {};

    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.item !== undefined) payload.item = updates.item;
    if (updates.customerName !== undefined)
      payload.customer_name = updates.customerName;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.timestamp !== undefined)
      payload.timestamp = new Date(updates.timestamp).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .select("*");

    if (error) {
      console.error("Failed to update transaction:", error.message);
      throw error;
    }

    if (data?.length) {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? normalizeTransactions(data)[0] : tx))
      );
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete transaction:", error.message);
      throw error;
    }

    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const deleteLast = useCallback(async () => {
    if (transactions.length === 0) return;
    await deleteTransaction(transactions[0].id);
  }, [deleteTransaction, transactions]);

  return {
    transactions,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteLast,
  };
}
