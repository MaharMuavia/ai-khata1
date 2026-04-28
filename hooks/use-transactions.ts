import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ai_khata_txs");
        if (saved) setTransactions(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ai_khata_txs", JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  const addTransaction = (t: Transaction) => {
    setTransactions((prev) => [t, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteLast = () => {
    setTransactions((prev) => prev.slice(1));
  };

  return {
    transactions,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteLast,
  };
}


