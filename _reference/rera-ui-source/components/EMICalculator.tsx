'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, IndianRupee, Percent, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const EMICalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(7500000); // 75 Lakhs default
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% default
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 years default

  // Calculate Monthly EMI using formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculation = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    if (monthlyRate === 0) {
      const emi = principal / totalMonths;
      return {
        monthlyEMI: Math.round(emi),
        totalPayment: Math.round(principal),
        totalInterest: 0,
      };
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - principal;

    return {
      monthlyEMI: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  }, [loanAmount, interestRate, tenureYears]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const principalPercentage = Math.round(
    (loanAmount / (calculation.totalPayment || 1)) * 100
  );
  const interestPercentage = 100 - principalPercentage;

  const handleApplyLoan = () => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: {
          interest: `Home Loan Assistance for ${formatCurrency(loanAmount)} at ${interestRate}% for ${tenureYears} Years`,
        },
      })
    );
  };

  return (
    <div id="calculator" className="bg-white border border-[#E8E2DA] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
        <Calculator className="w-4 h-4" />
        Banking Consortium Financial Tool
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] mb-2">
        Interactive Home Loan EMI Calculator
      </h3>
      <p className="text-xs sm:text-sm text-[#6D6A66] mb-8 leading-relaxed max-w-2xl">
        Estimate your monthly outflow for properties in Thane. Arnav Properties facilitates pre-approved project loans with SBI, HDFC, ICICI, and Axis Bank with zero processing fee waivers.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Input Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#1C1C1C]">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-[#C8A96A]" />
                Loan Amount Required
              </span>
              <span className="font-heading text-lg font-bold text-[#1C1C1C] tabular-nums">
                {formatCurrency(loanAmount)}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={50000000}
              step={200000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-[#EEE6DD] rounded-lg appearance-none cursor-pointer accent-[#C8A96A]"
            />
            <div className="flex justify-between text-[10px] text-[#A39E98]">
              <span>₹10 Lakhs</span>
              <span>₹2.50 Cr</span>
              <span>₹5.00 Cr</span>
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#1C1C1C]">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#C8A96A]" />
                Annual Interest Rate
              </span>
              <span className="font-heading text-lg font-bold text-[#1C1C1C] tabular-nums">
                {interestRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={6.5}
              max={12.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-[#EEE6DD] rounded-lg appearance-none cursor-pointer accent-[#C8A96A]"
            />
            <div className="flex justify-between text-[10px] text-[#A39E98]">
              <span>6.5% (Prime)</span>
              <span>8.5% (Current Avg)</span>
              <span>12.0%</span>
            </div>
          </div>

          {/* 3. Tenure in Years */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#1C1C1C]">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C8A96A]" />
                Loan Tenure
              </span>
              <span className="font-heading text-lg font-bold text-[#1C1C1C] tabular-nums">
                {tenureYears} Years ({tenureYears * 12} Months)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-[#EEE6DD] rounded-lg appearance-none cursor-pointer accent-[#C8A96A]"
            />
            <div className="flex justify-between text-[10px] text-[#A39E98]">
              <span>5 Years</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Results Calculation Card */}
        <div className="lg:col-span-5 bg-[#F8F5F1] border border-[#E8E2DA] p-6 flex flex-col justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6D6A66] font-semibold mb-1">
              Estimated Monthly Outflow
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C] tabular-nums mb-4">
              {formatCurrency(calculation.monthlyEMI)}
              <span className="text-xs font-body font-normal text-[#6D6A66]"> / month</span>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#E8E2DA] text-xs">
              <div className="flex justify-between">
                <span className="text-[#6D6A66]">Principal Amount:</span>
                <span className="font-semibold text-[#1C1C1C] tabular-nums">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6A66]">Total Interest Payable:</span>
                <span className="font-semibold text-[#1C1C1C] tabular-nums">
                  {formatCurrency(calculation.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8E2DA] text-sm">
                <strong className="text-[#1C1C1C]">Total Repayment:</strong>
                <strong className="text-[#1C1C1C] tabular-nums">
                  {formatCurrency(calculation.totalPayment)}
                </strong>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="mt-5 pt-3">
              <div className="text-[10px] uppercase tracking-wider text-[#A39E98] flex justify-between mb-1 font-semibold">
                <span>Principal: {principalPercentage}%</span>
                <span>Interest: {interestPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-[#E8E2DA] flex overflow-hidden">
                <div
                  style={{ width: `${principalPercentage}%` }}
                  className="bg-[#1C1C1C] h-full"
                />
                <div
                  style={{ width: `${interestPercentage}%` }}
                  className="bg-[#C8A96A] h-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2DA]">
            <button
              onClick={handleApplyLoan}
              className="w-full py-3 bg-[#1C1C1C] hover:bg-[#C8A96A] text-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Apply for Pre-Approved Rate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-[#A39E98] text-center mt-2">
              Free doorstep document pickup & sanction assistance in 72 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
