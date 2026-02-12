"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Image as ImageIcon,
  FileText,
  Upload,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Subject, ChildProfile } from "@/types";

export default function WorksheetUploadPage() {
  const router = useRouter();
  const { childProfiles } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState({
    child_profile_id: "",
    subject_id: "",
    school_date: new Date().toISOString().split("T")[0],
    chapter: "",
    textbook_reference: "",
    title: "",
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await apiClient.get("/subjects");
      return (
        data.data?.map(
          (s: { attributes: Subject }) => s.attributes
        ) as Subject[]
      ) || [];
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("image", selectedFile);
      if (metadata.title) formData.append("title", metadata.title);
      if (metadata.child_profile_id)
        formData.append("child_profile_id", metadata.child_profile_id);
      if (metadata.subject_id)
        formData.append("subject_id", metadata.subject_id);
      if (metadata.school_date)
        formData.append("school_date", metadata.school_date);
      if (metadata.chapter) formData.append("chapter", metadata.chapter);
      if (metadata.textbook_reference)
        formData.append("textbook_reference", metadata.textbook_reference);

      const { data } = await apiClient.post("/worksheets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      const worksheetId = data.data?.id || data.id;
      toast.success("Worksheet uploaded! Processing started.");
      router.push(`/parent/worksheets/${worksheetId}/processing`);
    },
    onError: () => {
      toast.error("Failed to upload worksheet");
    },
  });

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push("/parent/dashboard")}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 text-sm"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>
              <h1
                className="text-2xl font-black text-gray-800"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Upload Worksheet
              </h1>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AI will extract questions and create practice exercises
              </p>
            </div>
            <button
              onClick={() => router.push("/parent/dashboard")}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Upload Zone */}
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div
                className="relative border-2 border-dashed border-purple-300 rounded-3xl bg-purple-50/60 p-16 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                onClick={openFileDialog}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                    <Upload className="w-12 h-12 text-purple-600" />
                  </div>

                  <h3
                    className="text-xl font-bold text-gray-800 mb-2"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    Tap to take photo or select from gallery
                  </h3>
                  <p
                    className="text-sm text-gray-600 mb-8"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Supports images and PDF files
                  </p>

                  {/* Upload Method Buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                    >
                      <Camera className="w-5 h-5 text-purple-600" />
                      <span
                        className="font-semibold text-purple-600"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Camera
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                    >
                      <ImageIcon className="w-5 h-5 text-purple-600" />
                      <span
                        className="font-semibold text-purple-600"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Gallery
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                    >
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span
                        className="font-semibold text-purple-600"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        PDF
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-bold text-gray-800"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    Preview
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview("");
                    }}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Remove
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Worksheet preview"
                  className="w-full rounded-xl border-2 border-gray-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Info Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-8"
        >
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3
              className="text-lg font-bold text-gray-800"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Quick Info (Optional)
            </h3>
            <motion.div
              animate={{ rotate: showMetadata ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showMetadata && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Title */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) =>
                      setMetadata({ ...metadata, title: e.target.value })
                    }
                    placeholder="e.g., Math Worksheet - Fractions"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>

                {/* Child Selector */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Child
                  </label>
                  <select
                    value={metadata.child_profile_id}
                    onChange={(e) =>
                      setMetadata({
                        ...metadata,
                        child_profile_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <option value="">Select child (optional)</option>
                    {childProfiles.map((cp: ChildProfile) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Subject
                  </label>
                  <select
                    value={metadata.subject_id}
                    onChange={(e) =>
                      setMetadata({ ...metadata, subject_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <option value="">Auto-detect</option>
                    {subjects?.map((s: Subject) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    School Date
                  </label>
                  <input
                    type="date"
                    value={metadata.school_date}
                    onChange={(e) =>
                      setMetadata({ ...metadata, school_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>

                {/* Chapter/Unit */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Chapter/Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={metadata.chapter}
                    onChange={(e) =>
                      setMetadata({ ...metadata, chapter: e.target.value })
                    }
                    placeholder="e.g., Chapter 5: Fractions"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>

                {/* Textbook Reference */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Textbook Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={metadata.textbook_reference}
                    onChange={(e) =>
                      setMetadata({
                        ...metadata,
                        textbook_reference: e.target.value,
                      })
                    }
                    placeholder="e.g., Math Grade 4, Page 142"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upload Button */}
        <motion.button
          whileHover={{ scale: selectedFile ? 1.02 : 1 }}
          whileTap={{ scale: selectedFile ? 0.98 : 1 }}
          onClick={() => uploadMutation.mutate()}
          disabled={!selectedFile || uploadMutation.isPending}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
            selectedFile && !uploadMutation.isPending
              ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-xl cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {uploadMutation.isPending
            ? "Uploading..."
            : "Upload & Process with AI"}
        </motion.button>

        {/* Info Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4
                className="text-sm font-bold text-blue-900 mb-1"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                AI-Powered Processing
              </h4>
              <p
                className="text-xs text-blue-700 leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Our AI will extract all questions from the worksheet and
                automatically generate similar practice problems to help your
                child master each concept.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
