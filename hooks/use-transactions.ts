import { useCallback, useEffect, useState } from "react";
import { Transaction } from "@/lib/types";

function isValidTransactionId(id: string | undefined | null) {
  return typeof id === "string" && id.trim().length > 0 && id !== "null";
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded] = useState(true);

  const addTransaction = useCallback(async (t: Transaction) => {
    setTransactions((prev) => [t, ...prev]);
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!isValidTransactionId(id)) {
      throw new Error("Invalid transaction id");
    }

    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!isValidTransactionId(id)) {
      throw new Error("Invalid transaction id");
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
