"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Star, Sparkles, ArrowRight } from "lucide-react";
import type { Subject } from "@/types";
import {
  Calculator,
  FlaskConical,
  BookOpen,
  Globe,
  Landmark,
  Atom,
  Music,
  Palette,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  calculator: Calculator,
  flask: FlaskConical,
  "book-open": BookOpen,
  globe: Globe,
  landmark: Landmark,
  atom: Atom,
  music: Music,
  palette: Palette,
};

interface YourSubjectsProps {
  subjects: Subject[];
  onSubjectClick: (subjectId: string) => void;
}

function getProgressColor(mastery: number) {
  if (mastery === 100) return "#7C3AED";
  if (mastery >= 67) return "#14B8A6";
  if (mastery >= 34) return "#FBBF24";
  return "#9CA3AF";
}

function SubjectCard({
  subject,
  size = "carousel",
}: {
  subject: Subject;
  size?: "carousel" | "grid";
  onClick: () => void;
}) {
  const mastery = subject.enrollment?.mastery_level ?? 0;
  const level = subject.enrollment?.current_level ?? 1;
  const isPinned = subject.enrollment?.is_pinned ?? false;
  const progressColor = getProgressColor(mastery);
  const arcRadius = size === "carousel" ? 20 : 22;
  const circumference = 2 * Math.PI * arcRadius;
  const progressOffset = circumference - (mastery / 100) * circumference;
  const Icon = iconMap[subject.icon_name] || BookOpen;

  const cardWidth = size === "carousel" ? "140px" : "100%";
  const cardHeight = size === "carousel" ? "160px" : "180px";

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: `${subject.display_color}20`,
        width: cardWidth,
        height: cardHeight,
        minWidth: cardWidth,
      }}
      className="rounded-2xl p-4 shadow-md hover:shadow-xl transition-all relative overflow-hidden cursor-pointer"
    >
      {/* Pin indicator */}
      {isPinned && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-2 right-2 z-10"
        >
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        </motion.div>
      )}

      {/* Progress Arc with Icon */}
      <div
        className="relative mx-auto mb-3"
        style={{ width: "56px", height: "56px" }}
      >
        <svg
          width="56"
          height="56"
          className="transform -rotate-90 absolute inset-0"
        >
          <circle
            cx="28"
            cy="28"
            r={arcRadius}
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="white"
          />
          <motion.circle
            cx="28"
            cy="28"
            r={arcRadius}
            stroke={progressColor}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="text-gray-700" style={{ width: "24px", height: "24px" }} />
        </div>
      </div>

      {/* Level Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full mb-2"
        style={{
          backgroundColor: progressColor,
          boxShadow: `0 2px 8px ${progressColor}40`,
        }}
      >
        <Star className="w-3 h-3 text-white fill-white" />
        <span className="text-xs font-bold text-white">Lv {level}</span>
      </motion.div>

      {/* Subject Name */}
      <h3
        className="font-black text-center mb-1"
        style={{
          fontSize: size === "carousel" ? "15px" : "16px",
          color: "#1F2937",
          letterSpacing: "-0.5px",
        }}
      >
        {subject.name}
      </h3>

      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-1.5">
        <div
          className="h-1.5 bg-gray-200 rounded-full overflow-hidden flex-1"
          style={{ maxWidth: "70px" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${mastery}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color: progressColor }}>
          {mastery}%
        </span>
      </div>
    </motion.div>
  );
}

export function YourSubjects({ subjects, onSubjectClick }: YourSubjectsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const enrolledSubjects = subjects.filter((s) => s.enrollment);
  const shouldCollapse = subjects.length >= 6;

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const scrollWidth =
        carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      if (scrollWidth > 0) {
        setScrollProgress(scrollLeft / scrollWidth);
      }
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleScroll);
      return () => carousel.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const carouselSubjects =
    enrolledSubjects.length > 0 ? enrolledSubjects.slice(0, 6) : subjects.slice(0, 6);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-xl font-black text-gray-800">Your Subjects</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-bold"
          style={{ color: "#7C3AED" }}
        >
          <span>See All</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Carousel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>{`.flex.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
            {carouselSubjects.map((subject) => (
              <div
                key={subject.id}
                style={{ scrollSnapAlign: "start" }}
                onClick={() => onSubjectClick(subject.id)}
              >
                <SubjectCard
                  subject={subject}
                  size="carousel"
                  onClick={() => onSubjectClick(subject.id)}
                />
              </div>
            ))}
          </div>

          {/* Scroll Dots */}
          {carouselSubjects.length > 2 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {Array.from({
                length: Math.ceil(carouselSubjects.length / 2),
              }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width:
                      Math.abs(
                        scrollProgress * (carouselSubjects.length / 2) - i
                      ) < 0.5
                        ? "16px"
                        : "6px",
                    backgroundColor:
                      Math.abs(
                        scrollProgress * (carouselSubjects.length / 2) - i
                      ) < 0.5
                        ? "#7C3AED"
                        : "#D1D5DB",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* All Subjects Grid (Collapsible) */}
      {subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between mb-4 py-2"
          >
            <h3 className="text-lg font-bold text-gray-700">All Subjects</h3>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {(isExpanded || !shouldCollapse) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSubjectClick(subject.id)}
                    >
                      <SubjectCard
                        subject={subject}
                        size="grid"
                        onClick={() => onSubjectClick(subject.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isExpanded && shouldCollapse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                {subjects.slice(0, 4).map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSubjectClick(subject.id)}
                  >
                    <SubjectCard
                      subject={subject}
                      size="grid"
                      onClick={() => onSubjectClick(subject.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {subjects.length - 4 > 0 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsExpanded(true)}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/70 transition-all"
                >
                  <span className="text-sm font-bold text-purple-600">
                    + {subjects.length - 4} more subject
                    {subjects.length - 4 !== 1 ? "s" : ""}
                  </span>
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
