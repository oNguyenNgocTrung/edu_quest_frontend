"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  PerformanceDataPoint,
  SubjectBreakdownPoint,
  AccuracyDataPoint,
  MasteryDataPoint,
} from "@/types";
import { ArrowLeft, TrendingUp, Clock, Award, Flame } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();

  const { data: performance } = useQuery({
    queryKey: ["analytics", "performance"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/performance?days=7");
      return data as PerformanceDataPoint[];
    },
  });

  const { data: subjectBreakdown } = useQuery({
    queryKey: ["analytics", "subject_breakdown"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/subject_breakdown");
      return data as SubjectBreakdownPoint[];
    },
  });

  const { data: accuracy } = useQuery({
    queryKey: ["analytics", "accuracy"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/accuracy_by_topic");
      return data as AccuracyDataPoint[];
    },
  });

  const { data: mastery } = useQuery({
    queryKey: ["analytics", "mastery"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/mastery_progress");
      return data as MasteryDataPoint[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-8">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Learning Analytics
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <TrendingUp className="text-green-500 mx-auto mb-1" size={20} />
            <p className="text-lg font-bold text-gray-800">87%</p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Clock className="text-blue-500 mx-auto mb-1" size={20} />
            <p className="text-lg font-bold text-gray-800">35m</p>
            <p className="text-xs text-gray-500">Daily Avg</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Award className="text-purple-500 mx-auto mb-1" size={20} />
            <p className="text-lg font-bold text-gray-800">45</p>
            <p className="text-xs text-gray-500">Mastered</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Flame className="text-orange-500 mx-auto mb-1" size={20} />
            <p className="text-lg font-bold text-gray-800">12</p>
            <p className="text-xs text-gray-500">Streak</p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Weekly Performance
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ fill: "#6366F1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Time by Subject
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={subjectBreakdown || []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {subjectBreakdown?.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy by Topic */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Accuracy by Topic
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accuracy || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mastery Progress */}
        {mastery && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              Card Mastery
            </h3>
            <div className="flex items-center gap-4">
              {mastery.map((item) => (
                <div key={item.category} className="flex-1 text-center">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
