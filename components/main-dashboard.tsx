"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Calculator, FileText, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, Users, X, Download } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { parseTransactionCommand } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "@/lib/types";
import { isToday, isYesterday, isThisWeek, isThisMonth, format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// SpeechRecognition global declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type MainDashboardProps = {
  shopName?: string;
  mobileNumber?: string;
  onChangeShop?: () => void;
};

export default function MainDashboard({
  shopName = "AI Khata",
  onChangeShop,
}: MainDashboardProps) {
  const {
    transactions,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteLast,
  } = useTransactions();

  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [botMessage, setBotMessage] = useState("Assalam o Alaikum! Mai aapka AI assistant. Entry likhen ya bolen.");
  const [view, setView] = useState<"ledger" | "report">("ledger");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "week" | "month">("all");

  const recognitionRef = useRef<any>(null);

  const transactionsRef = useRef(transactions);
  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);

  const handleProcessCommand = React.useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setBotMessage("Soch raha hoon...");
    
    try {
      const result = await parseTransactionCommand(text, transactionsRef.current.slice(0, 10)); // send last 10 for context
      
      if (result.needsClarification) {
        setBotMessage(result.clarificationMessage || "Mujhe kuch tafseelaat chaliye, dobara batayen.");
      } else {
        if (result.action === "add") {
          await addTransaction({
            id: uuidv4(),
            category: result.category || "sales",
            amount: result.amount || 0,
            item: result.item,
            customerName: result.customerName,
            status: result.category === "udhaar" ? "unpaid" : undefined,
            timestamp: Date.now(),
          });
        } else if (result.action === "edit" && result.targetId) {
          await updateTransaction(result.targetId, {
            amount: result.amount,
            category: result.category,
            item: result.item,
            customerName: result.customerName,
          });
        } else if (result.action === "delete" && result.targetId) {
          await deleteTransaction(result.targetId);
        } else if (result.action === "delete_last") {
          await deleteLast();
        } else if (result.action === "report") {
          setView("report");
        }
        
        setBotMessage(result.responseMessage || "Entry theek se save ho gayi.");
        setInputText("");
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      let errorMsg = "Maazrat, entry save nahi ho saki. Console me error details hain.";
      
      if (message.toLowerCase().includes("row-level security")) {
        errorMsg = "Supabase me RLS policy issue hai. .env.local me SUPABASE_SERVICE_ROLE_KEY set karen.";
      } else if (message.toLowerCase().includes("supabase_service_role_key")) {
        errorMsg = "SUPABASE_SERVICE_ROLE_KEY .env.local me nahi hai. Supabase dashboard se service role key copy karke set karen.";
      } else if (message.toLowerCase().includes("missing") && message.toLowerCase().includes("env")) {
        errorMsg = "Environment variables set nahi hain. .env.local file check karen.";
      } else if (message.toLowerCase().includes("gemini")) {
        errorMsg = "Gemini API key ya AI parsing me masla hai. Env key check karen.";
      }
      
      setBotMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [addTransaction, updateTransaction, deleteTransaction, deleteLast, setView]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
              setInputText("");
              void handleProcessCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setBotMessage("Mic permission block hai. Browser me microphone allow karen.");
        } else if (event.error === "no-speech") {
          setBotMessage("Awaaz detect nahi hui. Dobara mic dabakar bolen.");
        } else {
          setBotMessage(`Mic error: ${event.error}. Chrome/Edge aur HTTPS ya localhost par try karen.`);
        }
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [handleProcessCommand]); 

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setBotMessage("Voice input is browser me available nahi. Text entry use karen ya Chrome/Edge me kholen.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInputText("");
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start speech recognition", error);
        setIsRecording(false);
        setBotMessage("Mic start nahi ho saka. Page refresh kar ke permission dobara allow karen.");
      }
    }
  };

  if (!isLoaded) {
    return null;
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    switch (dateFilter) {
      case "today":
        return isToday(t.timestamp);
      case "yesterday":
        return isYesterday(t.timestamp);
      case "week":
        return isThisWeek(t.timestamp, { weekStartsOn: 1 });
      case "month":
        return isThisMonth(t.timestamp);
      default:
        return true;
    }
  });

  const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const toCsvRow = (values: Array<string | number>) => values.map(csvEscape).join(",");
  const safeFileName =
    shopName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "ai_khata";

  const downloadReport = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ["Date", "Time", "Category", "Item/Customer", "Amount (Rs)"];
    const totalSales = filteredTransactions.filter(t => t.category === "sales").reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.category === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalUdhaar = filteredTransactions.filter(t => t.category === "udhaar" && t.status === "unpaid").reduce((sum, t) => sum + t.amount, 0);
    const reportNetProfit = totalSales - totalExpenses;
    const profitLabel = reportNetProfit >= 0 ? "Profit" : "Loss";
    
    const rows = filteredTransactions.map(t => {
      const date = format(t.timestamp, "yyyy-MM-dd");
      const time = format(t.timestamp, "HH:mm:ss");
      const category = t.category.toUpperCase();
      const itemOrCustomer = t.item || t.customerName || "General Entry";
      const amount = t.amount;
      return toCsvRow([date, time, category, itemOrCustomer, amount]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + [
      toCsvRow(["AI Khata Report"]),
      toCsvRow(["Shop Name", shopName]),
      toCsvRow(["Report Filter", dateFilter]),
      toCsvRow(["Generated At", format(new Date(), "yyyy-MM-dd HH:mm:ss")]),
      "",
      toCsvRow(["Summary"]),
      toCsvRow(["Total Sales", totalSales]),
      toCsvRow(["Total Expenses", totalExpenses]),
      toCsvRow(["Udhaar Outstanding", totalUdhaar]),
      toCsvRow(["Net Profit", reportNetProfit]),
      toCsvRow(["Profit Status", profitLabel]),
      "",
      toCsvRow(["Transaction Details"]),
      toCsvRow(headers),
      ...rows,
    ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AI_Khata_${safeFileName}_Report_${dateFilter}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const totalSales = filteredTransactions.filter(t => t.category === "sales").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.category === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalUdhaarGiven = filteredTransactions.filter(t => t.category === "udhaar" && t.status === "unpaid").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const isProfitPositive = netProfit >= 0;
  const totalEntries = filteredTransactions.length;
  const formatAmount = (amount: number) => amount.toLocaleString();

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    const dateStr = format(t.timestamp, "d MMM yyyy");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Chart data
  const chartData = [
    { name: "Sales", amount: totalSales },
    { name: "Expenses", amount: totalExpenses },
    { name: "Profit", amount: netProfit },
    { name: "Udhaar", amount: totalUdhaarGiven },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-stone-50 shadow-xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-md z-10 flex justify-between items-center">
        <div className="min-w-0 flex-1 pr-3">
          <h1 className="text-lg font-bold leading-tight whitespace-normal break-words">{shopName}</h1>
        </div>
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-emerald-700 text-white border-none rounded-lg p-2 text-sm outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button 
            onClick={downloadReport}
            className="p-2 rounded-lg transition-colors hover:bg-emerald-500"
            title="Download CSV Report"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => setView("ledger")}
            className={`p-2 rounded-lg transition-colors ${view === "ledger" ? "bg-emerald-700" : "hover:bg-emerald-500"}`}
          >
            <Calculator size={20} />
          </button>
          <button 
            onClick={() => setView("report")}
            className={`p-2 rounded-lg transition-colors ${view === "report" ? "bg-emerald-700" : "hover:bg-emerald-500"}`}
          >
            <FileText size={20} />
          </button>
          {onChangeShop && (
            <button
              onClick={onChangeShop}
              className="p-2 rounded-lg transition-colors hover:bg-emerald-500"
              title="Change shop"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {view === "ledger" ? (
          <div className="space-y-6">
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-stone-500 mb-1">Sales</p>
                  <p className="font-bold text-emerald-600">Rs {totalSales}</p>
                </div>
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-stone-500 mb-1">Expense</p>
                  <p className="font-bold text-red-600">Rs {totalExpenses}</p>
                </div>
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <TrendingDown size={16} />
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between">
                 <div>
                  <p className="text-stone-500 mb-1">Udhaar</p>
                  <p className="font-bold text-amber-600">Rs {totalUdhaarGiven}</p>
                 </div>
                 <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                  <Users size={16} />
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between">
                 <div>
                  <p className="text-stone-500 mb-1">Profit</p>
                  <p className="font-bold text-blue-600">Rs {netProfit}</p>
                 </div>
                 <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <DollarSign size={16} />
                </div>
              </div>
            </div>

            {/* AI Message Bubble */}
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-emerald-100 p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] text-stone-700 text-sm">
                {botMessage}
              </div>
            </div>

            {/* Ledger List */}
            <div>
              <h2 className="font-semibold text-stone-800 mb-3 ml-1">Recent Entries</h2>
            {filteredTransactions.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded-xl text-stone-400">
                  {transactions.length === 0 ? "No records yet. Koi entry bol kar ya likh kar add karen." : "No records found for the selected period."}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedTransactions).map(([date, dailyTransactions]) => (
                    <div key={date}>
                      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1">{date}</h3>
                      <div className="space-y-3">
                        {dailyTransactions.map((t) => (
                          <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center group">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  t.category === 'sales' ? 'bg-emerald-100 text-emerald-700' :
                                  t.category === 'expense' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {t.category.toUpperCase()}
                                </span>
                                <span className="text-xs text-stone-400">
                                  {format(t.timestamp, "h:mm a")}
                                </span>
                              </div>
                              <p className="font-medium text-stone-800">
                                {t.item || t.customerName || "General Entry"}
                              </p>
                            </div>
                            <div className="text-right">
                               <p className={`font-bold ${
                                  t.category === 'sales' ? 'text-emerald-600' :
                                  t.category === 'expense' ? 'text-red-600' :
                                  'text-amber-600'
                                }`}>
                                 Rs {t.amount}
                               </p>
                               <div className="flex gap-2 justify-end mt-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => setEditTx(t)} className="text-stone-400 hover:text-blue-500 transition-colors">
                                   <Edit2 size={14} />
                                 </button>
                                 <button
                                   onClick={async () => {
                                     try {
                                       await deleteTransaction(t.id);
                                     } catch (error) {
                                       console.error(error);
                                       setBotMessage("Entry delete nahi ho saki. Supabase policy check karen.");
                                     }
                                   }}
                                   className="text-stone-400 hover:text-red-500 transition-colors"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-[28px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-[1px] shadow-lg shadow-emerald-200/60">
              <div className="rounded-[27px] bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Business Report</p>
                    <h2 className="mt-1 text-2xl font-bold text-stone-900 break-words">{shopName}</h2>
                    <p className="mt-1 text-sm text-stone-500">A clean snapshot of sales, expense, and profit for the selected period.</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right border border-emerald-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Filter</p>
                    <p className="text-sm font-semibold text-stone-800 capitalize">{dateFilter === "all" ? "All Time" : dateFilter}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                    <p className="text-xs font-medium text-stone-500 mb-2">Net Profit</p>
                    <div className={`text-2xl font-black ${isProfitPositive ? "text-emerald-600" : "text-red-600"}`}>
                      Rs {formatAmount(netProfit)}
                    </div>
                    <p className={`mt-1 text-xs font-medium ${isProfitPositive ? "text-emerald-700" : "text-red-600"}`}>
                      {isProfitPositive ? "Profit" : "Loss"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                    <p className="text-xs font-medium text-stone-500 mb-2">Total Sales</p>
                    <div className="text-2xl font-black text-stone-900">Rs {formatAmount(totalSales)}</div>
                    <p className="mt-1 text-xs font-medium text-stone-500">{totalEntries} entries recorded</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                    <p className="text-xs font-medium text-stone-500 mb-2">Expenses</p>
                    <div className="text-2xl font-black text-red-600">Rs {formatAmount(totalExpenses)}</div>
                    <p className="mt-1 text-xs font-medium text-stone-500">Money spent</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                    <p className="text-xs font-medium text-stone-500 mb-2">Udhaar</p>
                    <div className="text-2xl font-black text-amber-600">Rs {formatAmount(totalUdhaarGiven)}</div>
                    <p className="mt-1 text-xs font-medium text-stone-500">Unpaid balance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-stone-900">Financial Overview</h3>
                  <p className="text-sm text-stone-500">Sales vs expense vs profit</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${isProfitPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {isProfitPositive ? "Profit up" : "Loss alert"}
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="amount" fill="#059669" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm border border-stone-100">
              <h3 className="font-bold text-stone-900 mb-3">Report Notes</h3>
              <div className="space-y-3 text-sm text-stone-600">
                <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <span>Total transactions</span>
                  <span className="font-semibold text-stone-900">{totalEntries}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <span>Date range</span>
                  <span className="font-semibold text-stone-900 capitalize">{dateFilter === "all" ? "All Time" : dateFilter}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area (Sticky Bottom) */}
      <div className="absolute bottom-0 w-full bg-white border-t border-stone-200 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-stone-100 rounded-2xl p-2 flex flex-col focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <input
               type="text"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="Entry likhen..."
               className="bg-transparent border-none focus:outline-none px-2 py-1 text-stone-700 w-full"
               onKeyDown={(e) => {
                 if (e.key === "Enter") {
                   handleProcessCommand(inputText);
                 }
               }}
               disabled={isProcessing}
            />
          </div>
          
          {inputText.trim() ? (
            <button 
              onClick={() => handleProcessCommand(inputText)}
              disabled={isProcessing}
              className="bg-emerald-600 text-white p-3.5 rounded-full hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 flex-shrink-0"
            >
              <Send size={20} />
            </button>
          ) : (
            <button 
              onClick={toggleRecording}
              className={`${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'} text-white p-3.5 rounded-full hover:bg-opacity-90 transition-all shadow-md flex-shrink-0`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>
        {isRecording && <div className="text-center text-xs text-red-500 mt-2 animate-pulse">Sun raha hoon... (Bolain)</div>}
      </div>

      {/* Edit Modal */}
      {editTx && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <button onClick={() => setEditTx(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-stone-800">Edit Entry</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase">Category</label>
                <select 
                   value={editTx.category} 
                   onChange={(e) => setEditTx({...editTx, category: e.target.value as any})}
                   className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 outline-none focus:border-emerald-500"
                >
                  <option value="sales">Sales</option>
                  <option value="expense">Expense</option>
                  <option value="udhaar">Udhaar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase">Amount</label>
                <input 
                  type="number"
                  value={editTx.amount}
                  onChange={(e) => setEditTx({...editTx, amount: Number(e.target.value)})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1 uppercase">
                  {editTx.category === 'udhaar' ? 'Customer Name e.g. Aslam' : 'Item Description'}
                </label>
                <input 
                  type="text"
                  value={editTx.category === 'udhaar' ? (editTx.customerName || '') : (editTx.item || '')}
                  onChange={(e) => {
                    if (editTx.category === 'udhaar') {
                      setEditTx({...editTx, customerName: e.target.value, item: undefined});
                    } else {
                      setEditTx({...editTx, item: e.target.value, customerName: undefined});
                    }
                  }}
                  placeholder="Details..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 outline-none focus:border-emerald-500"
                />
              </div>

              <button 
                onClick={async () => {
                  try {
                    await updateTransaction(editTx.id, {
                      category: editTx.category,
                      amount: editTx.amount,
                      item: editTx.item,
                      customerName: editTx.customerName,
                    });
                    setEditTx(null);
                  } catch (error) {
                    console.error(error);
                    setBotMessage("Entry update nahi ho saki. Supabase policy check karen.");
                  }
                }}
                className="w-full bg-emerald-600 text-white font-semibold rounded-lg p-3 hover:bg-emerald-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
