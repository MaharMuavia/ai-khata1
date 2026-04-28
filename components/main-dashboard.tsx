"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Calculator, FileText, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, Users, X } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { parseTransactionCommand } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
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

export default function MainDashboard() {
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
          addTransaction({
            id: uuidv4(),
            category: result.category || "sales",
            amount: result.amount || 0,
            item: result.item,
            customerName: result.customerName,
            status: result.category === "udhaar" ? "unpaid" : undefined,
            timestamp: Date.now(),
          });
        } else if (result.action === "edit" && result.targetId) {
          updateTransaction(result.targetId, {
            amount: result.amount,
            category: result.category,
            item: result.item,
            customerName: result.customerName,
          });
        } else if (result.action === "delete" && result.targetId) {
          deleteTransaction(result.targetId);
        } else if (result.action === "delete_last") {
          deleteLast();
        } else if (result.action === "report") {
          setView("report");
        }
        
        setBotMessage(result.responseMessage || "Entry theek se save ho gayi.");
        setInputText("");
      }
    } catch (error) {
      console.error(error);
      setBotMessage("Maazrat, samajh nahi aaya. Dobara koshish karen.");
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
      // Leave lang default or set to 'en-US' / 'ur-PK'. Default often handles mixed best.
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleProcessCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [handleProcessCommand]); 

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInputText("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  if (!isLoaded) {
    return null;
  }

  // Stats calculation
  const totalSales = transactions.filter(t => t.category === "sales").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.category === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalUdhaarGiven = transactions.filter(t => t.category === "udhaar" && t.status === "unpaid").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalSales - totalExpenses;

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, t) => {
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
        <div>
          <h1 className="text-xl font-bold">AI Khata</h1>
          <p className="text-xs opacity-80">Smart Business Assistant</p>
        </div>
        <div className="flex gap-2">
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
              {transactions.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded-xl text-stone-400">
                  No records yet. Koi entry bol kar ya likh kar add karen.
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
                                 <button onClick={() => deleteTransaction(t.id)} className="text-stone-400 hover:text-red-500 transition-colors">
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
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-stone-800 ml-1">Business Report</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
              <h3 className="text-stone-500 mb-4 text-sm font-medium">Financial Overview</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                  <p className="text-stone-500 mb-1">Net Profit</p>
                  <p className="font-bold text-xl text-emerald-600">Rs {netProfit}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                  <p className="text-stone-500 mb-1">Total Sales</p>
                  <p className="font-bold text-xl text-stone-800">Rs {totalSales}</p>
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
                onClick={() => {
                  updateTransaction(editTx.id, {
                    category: editTx.category,
                    amount: editTx.amount,
                    item: editTx.item,
                    customerName: editTx.customerName,
                  });
                  setEditTx(null);
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
