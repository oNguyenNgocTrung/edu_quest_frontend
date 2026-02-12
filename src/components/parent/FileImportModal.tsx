"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Download,
  Check,
} from "lucide-react";
import type { WorksheetExtractedQuestion } from "@/types";

// ─── Types ──────────────────────────────────────────────────────

export interface ImportedFlashcard {
  front_text: string;
  back_text: string;
}

export interface ImportedQuestion {
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
  xp_value?: number;
}

type ImportType = "flashcards" | "questions" | "worksheet_questions";

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: ImportType;
  onImport: (
    data:
      | ImportedFlashcard[]
      | ImportedQuestion[]
      | WorksheetExtractedQuestion[]
  ) => void;
  isSubmitting?: boolean;
}

interface ParseResult<T> {
  data: T[];
  errors: string[];
}

// ─── CSV Parsing ────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows = lines.slice(1).map((line) => parseCSVLine(line));
  return { headers, rows };
}

// ─── Flashcard Parsing ──────────────────────────────────────────

function parseFlashcardsJSON(raw: unknown): ParseResult<ImportedFlashcard> {
  const errors: string[] = [];
  const data: ImportedFlashcard[] = [];

  if (!Array.isArray(raw)) {
    return { data: [], errors: ["JSON must be an array of flashcards"] };
  }

  raw.forEach((item, i) => {
    const front = item.front_text || item.front || item.question || "";
    const back = item.back_text || item.back || item.answer || "";
    if (!front) errors.push(`Row ${i + 1}: Missing front/question text`);
    if (!back) errors.push(`Row ${i + 1}: Missing back/answer text`);
    if (front && back) data.push({ front_text: String(front), back_text: String(back) });
  });

  return { data, errors };
}

function parseFlashcardsCSV(text: string): ParseResult<ImportedFlashcard> {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];
  const data: ImportedFlashcard[] = [];

  const frontIdx = headers.findIndex((h) =>
    ["front", "front_text", "question"].includes(h)
  );
  const backIdx = headers.findIndex((h) =>
    ["back", "back_text", "answer"].includes(h)
  );

  if (frontIdx === -1) errors.push("Missing 'front' column in CSV header");
  if (backIdx === -1) errors.push("Missing 'back' column in CSV header");
  if (errors.length > 0) return { data, errors };

  rows.forEach((row, i) => {
    const front = row[frontIdx] || "";
    const back = row[backIdx] || "";
    if (!front) errors.push(`Row ${i + 1}: Missing front text`);
    if (!back) errors.push(`Row ${i + 1}: Missing back text`);
    if (front && back) data.push({ front_text: front, back_text: back });
  });

  return { data, errors };
}

// ─── Question Parsing ───────────────────────────────────────────

function parseQuestionsJSON(raw: unknown): ParseResult<ImportedQuestion> {
  const errors: string[] = [];
  const data: ImportedQuestion[] = [];

  if (!Array.isArray(raw)) {
    return { data: [], errors: ["JSON must be an array of questions"] };
  }

  raw.forEach((item, i) => {
    const questionText = item.question_text || item.question || "";
    const options: string[] = Array.isArray(item.options) ? item.options : [];
    const correctIdx =
      item.correct_answer_index ??
      (item.correct_answer !== undefined
        ? letterToIndex(String(item.correct_answer))
        : undefined);
    const explanation = item.explanation || "";
    const xpValue = item.xp_value || 10;

    if (!questionText)
      errors.push(`Row ${i + 1}: Missing question text`);
    if (options.length < 2)
      errors.push(`Row ${i + 1}: At least 2 options required`);
    if (correctIdx === undefined || correctIdx < 0)
      errors.push(`Row ${i + 1}: Missing or invalid correct answer`);
    if (correctIdx !== undefined && correctIdx >= options.length)
      errors.push(`Row ${i + 1}: Correct answer index out of range`);

    if (
      questionText &&
      options.length >= 2 &&
      correctIdx !== undefined &&
      correctIdx >= 0 &&
      correctIdx < options.length
    ) {
      data.push({
        question_text: String(questionText),
        options: options.map(String),
        correct_answer_index: correctIdx,
        explanation: explanation ? String(explanation) : undefined,
        xp_value: Number(xpValue) || 10,
      });
    }
  });

  return { data, errors };
}

function parseQuestionsCSV(text: string): ParseResult<ImportedQuestion> {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];
  const data: ImportedQuestion[] = [];

  const questionIdx = headers.findIndex((h) =>
    ["question", "question_text"].includes(h)
  );
  const optionIndices = ["option_a", "option_b", "option_c", "option_d"].map(
    (name) => headers.indexOf(name)
  );
  const correctIdx = headers.findIndex((h) =>
    ["correct_answer", "correct"].includes(h)
  );
  const explanationIdx = headers.indexOf("explanation");

  if (questionIdx === -1)
    errors.push("Missing 'question' column in CSV header");
  if (optionIndices[0] === -1 || optionIndices[1] === -1)
    errors.push("Missing option columns (need at least option_a and option_b)");
  if (correctIdx === -1)
    errors.push("Missing 'correct_answer' column in CSV header");
  if (errors.length > 0) return { data, errors };

  rows.forEach((row, i) => {
    const questionText = row[questionIdx] || "";
    const options = optionIndices
      .map((idx) => (idx >= 0 ? row[idx] || "" : ""))
      .filter((o) => o !== "");
    const correctAnswerRaw = row[correctIdx] || "";
    const explanation =
      explanationIdx >= 0 ? row[explanationIdx] || "" : "";

    const answerIndex = letterToIndex(correctAnswerRaw);

    if (!questionText)
      errors.push(`Row ${i + 1}: Missing question text`);
    if (options.length < 2)
      errors.push(`Row ${i + 1}: At least 2 options required`);
    if (answerIndex < 0)
      errors.push(
        `Row ${i + 1}: Invalid correct answer "${correctAnswerRaw}" (use A, B, C, or D)`
      );
    if (answerIndex >= options.length)
      errors.push(`Row ${i + 1}: Correct answer index out of range`);

    if (
      questionText &&
      options.length >= 2 &&
      answerIndex >= 0 &&
      answerIndex < options.length
    ) {
      data.push({
        question_text: questionText,
        options,
        correct_answer_index: answerIndex,
        explanation: explanation || undefined,
        xp_value: 10,
      });
    }
  });

  return { data, errors };
}

// ─── Worksheet Question Parsing ─────────────────────────────────

function parseWorksheetQuestionsJSON(
  raw: unknown
): ParseResult<WorksheetExtractedQuestion> {
  const errors: string[] = [];
  const data: WorksheetExtractedQuestion[] = [];

  if (!Array.isArray(raw)) {
    return { data: [], errors: ["JSON must be an array of questions"] };
  }

  raw.forEach((item, i) => {
    const text = item.text || item.question_text || item.question || "";
    const type = normalizeQuestionType(item.type || "mcq");
    const options: string[] = Array.isArray(item.options) ? item.options : [];
    const correctAnswer = item.correct_answer || "";

    if (!text) errors.push(`Row ${i + 1}: Missing question text`);
    if (!correctAnswer) errors.push(`Row ${i + 1}: Missing correct answer`);
    if (type === "mcq" && options.length < 2)
      errors.push(`Row ${i + 1}: MCQ needs at least 2 options`);

    if (text && correctAnswer) {
      data.push({
        id: Date.now() + i,
        number: i + 1,
        text: String(text),
        type,
        options: options.map(String),
        correct_answer: String(correctAnswer),
        confidence: 100,
        needs_review: false,
        similar_exercises: [],
      });
    }
  });

  return { data, errors };
}

function parseWorksheetQuestionsCSV(
  text: string
): ParseResult<WorksheetExtractedQuestion> {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];
  const data: WorksheetExtractedQuestion[] = [];

  const textIdx = headers.findIndex((h) =>
    ["text", "question", "question_text"].includes(h)
  );
  const typeIdx = headers.indexOf("type");
  const optionIndices = ["option_a", "option_b", "option_c", "option_d"].map(
    (name) => headers.indexOf(name)
  );
  const correctIdx = headers.findIndex((h) =>
    ["correct_answer", "correct"].includes(h)
  );

  if (textIdx === -1) errors.push("Missing 'text' column in CSV header");
  if (correctIdx === -1)
    errors.push("Missing 'correct_answer' column in CSV header");
  if (errors.length > 0) return { data, errors };

  rows.forEach((row, i) => {
    const questionText = row[textIdx] || "";
    const type = normalizeQuestionType(
      typeIdx >= 0 ? row[typeIdx] || "mcq" : "mcq"
    );
    const options = optionIndices
      .map((idx) => (idx >= 0 ? row[idx] || "" : ""))
      .filter((o) => o !== "");
    const correctAnswer = row[correctIdx] || "";

    if (!questionText) errors.push(`Row ${i + 1}: Missing question text`);
    if (!correctAnswer) errors.push(`Row ${i + 1}: Missing correct answer`);

    if (questionText && correctAnswer) {
      data.push({
        id: Date.now() + i,
        number: i + 1,
        text: questionText,
        type,
        options:
          type === "true-false" ? ["True", "False"] : options,
        correct_answer: correctAnswer,
        confidence: 100,
        needs_review: false,
        similar_exercises: [],
      });
    }
  });

  return { data, errors };
}

// ─── Helpers ────────────────────────────────────────────────────

function letterToIndex(letter: string): number {
  const upper = letter.trim().toUpperCase();
  if (upper.length === 1 && upper >= "A" && upper <= "Z") {
    return upper.charCodeAt(0) - 65;
  }
  const num = parseInt(upper, 10);
  if (!isNaN(num)) return num;
  return -1;
}

function normalizeQuestionType(
  type: string
): "mcq" | "fill-blank" | "true-false" {
  const t = type.toLowerCase().trim();
  if (["mcq", "multiple_choice", "multiple-choice", "mc"].includes(t))
    return "mcq";
  if (
    [
      "fill_blank",
      "fill-blank",
      "fill_in_the_blank",
      "fill-in-the-blank",
      "blank",
    ].includes(t)
  )
    return "fill-blank";
  if (
    ["true_false", "true-false", "true/false", "tf", "truefalse"].includes(t)
  )
    return "true-false";
  return "mcq";
}

// ─── Template Generation ────────────────────────────────────────

function downloadTemplate(importType: ImportType, format: "csv" | "json") {
  let content: string;
  let filename: string;

  if (importType === "flashcards") {
    if (format === "json") {
      content = JSON.stringify(
        [
          { front: "What is 2+2?", back: "4" },
          { front: "Capital of France?", back: "Paris" },
        ],
        null,
        2
      );
      filename = "flashcards_template.json";
    } else {
      content = `front,back\n"What is 2+2?","4"\n"Capital of France?","Paris"`;
      filename = "flashcards_template.csv";
    }
  } else if (importType === "questions") {
    if (format === "json") {
      content = JSON.stringify(
        [
          {
            question_text: "What is 2+2?",
            options: ["3", "4", "5", "6"],
            correct_answer_index: 1,
            explanation: "Basic addition",
          },
        ],
        null,
        2
      );
      filename = "questions_template.json";
    } else {
      content = `question,option_a,option_b,option_c,option_d,correct_answer,explanation\n"What is 2+2?","3","4","5","6","B","Basic addition"`;
      filename = "questions_template.csv";
    }
  } else {
    if (format === "json") {
      content = JSON.stringify(
        [
          {
            text: "What is 2+2?",
            type: "mcq",
            options: ["3", "4", "5", "6"],
            correct_answer: "4",
          },
          {
            text: "Is the sky blue?",
            type: "true-false",
            correct_answer: "True",
          },
        ],
        null,
        2
      );
      filename = "worksheet_questions_template.json";
    } else {
      content = `text,type,option_a,option_b,option_c,option_d,correct_answer\n"What is 2+2?","mcq","3","4","5","6","4"\n"Is the sky blue?","true-false","","","","","True"`;
      filename = "worksheet_questions_template.csv";
    }
  }

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ──────────────────────────────────────────────────

export default function FileImportModal({
  isOpen,
  onClose,
  importType,
  onImport,
  isSubmitting = false,
}: FileImportModalProps) {
  const { t } = useTranslation('parent');
  const [parsedData, setParsedData] = useState<
    ImportedFlashcard[] | ImportedQuestion[] | WorksheetExtractedQuestion[]
  >([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setParsedData([]);
    setErrors([]);
    setFileName(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const processFile = useCallback(
    (file: File) => {
      setErrors([]);
      setParsedData([]);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text || !text.trim()) {
          setErrors([t('fileImport.fileEmpty')]);
          return;
        }

        const isJSON = file.name.endsWith(".json");

        try {
          if (importType === "flashcards") {
            const result = isJSON
              ? parseFlashcardsJSON(JSON.parse(text))
              : parseFlashcardsCSV(text);
            setParsedData(result.data);
            setErrors(result.errors);
          } else if (importType === "questions") {
            const result = isJSON
              ? parseQuestionsJSON(JSON.parse(text))
              : parseQuestionsCSV(text);
            setParsedData(result.data);
            setErrors(result.errors);
          } else {
            const result = isJSON
              ? parseWorksheetQuestionsJSON(JSON.parse(text))
              : parseWorksheetQuestionsCSV(text);
            setParsedData(result.data);
            setErrors(result.errors);
          }
        } catch {
          setErrors([
            isJSON
              ? "Invalid JSON format. Check syntax and try again."
              : "Failed to parse CSV. Check format and try again.",
          ]);
        }
      };
      reader.readAsText(file);
    },
    [importType, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const typeLabel =
    importType === "flashcards"
      ? t('fileImport.flashcards')
      : importType === "questions"
        ? t('fileImport.questions')
        : t('fileImport.worksheetQuestions');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2
                className="text-xl font-bold text-gray-800"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t('fileImport.title', { type: typeLabel })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('fileImport.subtitle')}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Drop Zone */}
            {parsedData.length === 0 && (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <Upload
                    className={`w-10 h-10 mx-auto mb-3 ${
                      isDragging ? "text-indigo-500" : "text-gray-400"
                    }`}
                  />
                  <p className="font-semibold text-gray-700">
                    {isDragging
                      ? t('fileImport.dropHere')
                      : t('fileImport.dropFile')}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {t('fileImport.supportedFormats')}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Template Downloads */}
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <span className="text-gray-400">{t('fileImport.downloadTemplate')}</span>
                  <button
                    onClick={() => downloadTemplate(importType, "csv")}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Download size={14} />
                    CSV
                  </button>
                  <button
                    onClick={() => downloadTemplate(importType, "json")}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Download size={14} />
                    JSON
                  </button>
                </div>
              </>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="font-semibold text-red-700 text-sm">
                    {t('fileImport.errorsFound', { count: errors.length })}
                  </span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-red-400">
                      {t('fileImport.andMore', { count: errors.length - 5 })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Preview */}
            {parsedData.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-green-500" />
                    <span className="font-semibold text-gray-700 text-sm">
                      {fileName}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {t('fileImport.itemsReady', { count: parsedData.length })}
                    </span>
                  </div>
                  <button
                    onClick={resetState}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    {t('fileImport.chooseDifferent')}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-2 text-gray-500 font-medium">
                            #
                          </th>
                          {importType === "flashcards" ? (
                            <>
                              <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                {t('fileImport.front')}
                              </th>
                              <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                {t('fileImport.back')}
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                {t('fileImport.question')}
                              </th>
                              <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                {t('fileImport.answer')}
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(parsedData as Array<ImportedFlashcard | ImportedQuestion | WorksheetExtractedQuestion>).map(
                          (item, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="px-4 py-2 text-gray-400">
                                {i + 1}
                              </td>
                              {importType === "flashcards" ? (
                                <>
                                  <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                                    {(item as ImportedFlashcard).front_text}
                                  </td>
                                  <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                                    {(item as ImportedFlashcard).back_text}
                                  </td>
                                </>
                              ) : importType === "questions" ? (
                                <>
                                  <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                                    {(item as ImportedQuestion).question_text}
                                  </td>
                                  <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                                    {(item as ImportedQuestion).options[
                                      (item as ImportedQuestion)
                                        .correct_answer_index
                                    ] || "—"}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                                    {
                                      (item as WorksheetExtractedQuestion).text
                                    }
                                  </td>
                                  <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                                    {
                                      (item as WorksheetExtractedQuestion)
                                        .correct_answer
                                    }
                                  </td>
                                </>
                              )}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {parsedData.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                {t('fileImport.cancel')}
              </button>
              <button
                onClick={() => onImport(parsedData)}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('fileImport.importing')}
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {t('fileImport.importCount', { count: parsedData.length })}
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
