"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, KeyRound, Smartphone, Store } from "lucide-react";
import MainDashboard from "@/components/main-dashboard";

type ShopProfile = {
  shopName: string;
  mobileNumber: string;
};

function formatMobileNumber(mobileNumber: string) {
  return `+92 ${mobileNumber}`;
}

function getRandomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function Home() {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [shopName, setShopName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedShopName = shopName.trim();

    if (!trimmedShopName) {
      setError("Shop name likhen.");
      return;
    }

    if (mobileNumber.length !== 10 || !mobileNumber.startsWith("3")) {
      setError("Pakistan mobile number 10 digits ka ho aur 3 se start ho.");
      return;
    }

    setError("");
    setMockOtp(getRandomOtp());
    setOtpInput("");
    setOtpSent(true);
  };

  const handleVerifyOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otpInput !== mockOtp) {
      setError("OTP ghalat hai. Screen par dikhaya gaya mock code enter karen.");
      return;
    }

    const nextProfile = {
      shopName: shopName.trim(),
      mobileNumber: formatMobileNumber(mobileNumber),
    };

    setProfile(nextProfile);
  };

  const handleReset = () => {
    setProfile(null);
    setShopName("");
    setMobileNumber("");
    setOtpSent(false);
    setMockOtp("");
    setOtpInput("");
    setError("");
  };

  if (profile) {
    return (
      <main className="min-h-screen bg-stone-100 text-stone-900 font-sans">
        <MainDashboard
          shopName={profile.shopName}
          onChangeShop={handleReset}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5,_#f8fafc_48%,_#f5f5f4)] text-stone-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 text-sm font-medium mb-4 shadow-sm">
            <KeyRound size={16} />
            Shop setup
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">AI Khata</h1>
          <p className="mt-2 text-sm text-stone-600">Apna shop name aur Pakistan mobile number daal kar dashboard kholen.</p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 backdrop-blur shadow-2xl shadow-stone-200/70 p-6">
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Shop name</label>
              <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <Store className="shrink-0 text-stone-400" size={18} />
                <input
                  value={shopName}
                  onChange={(event) => setShopName(event.target.value)}
                  placeholder="مثال: Al Noor General Store"
                  className="w-full bg-transparent text-stone-800 outline-none placeholder:text-stone-400"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Mobile number</label>
              <div className="flex overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <div className="flex items-center gap-2 border-r border-stone-200 px-4 py-3 text-stone-600 bg-stone-100">
                  <Smartphone size={18} />
                  <span className="font-semibold">+92</span>
                </div>
                <input
                  value={mobileNumber}
                  onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="3XXXXXXXXX"
                  inputMode="numeric"
                  className="w-full bg-transparent px-4 py-3 text-stone-800 outline-none placeholder:text-stone-400"
                />
              </div>
              <p className="mt-2 text-xs text-stone-500">Pakistan format: +92 3XXXXXXXXX</p>
            </div>

            {otpSent && (
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <KeyRound size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Mock OTP generated</p>
                    <p className="text-xs text-amber-800">Real SMS bhejna abhi add nahi hua. Testing ke liye yeh code use karen: {mockOtp}</p>
                  </div>
                </div>

                <input
                  value={otpInput}
                  onChange={(event) => setOtpInput(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter OTP"
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-stone-800 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              {otpSent ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setMockOtp("");
                      setOtpInput("");
                      setError("");
                    }}
                    className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                  >
                    Open dashboard
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                >
                  Send OTP
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
