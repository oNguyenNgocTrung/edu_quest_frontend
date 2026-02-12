"use client";

import { motion } from "framer-motion";
import {
  Star,
  Trophy,
  Brain,
  Sparkles,
  ArrowRight,
  Check,
  Users,
  BookOpen,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";

const features = [
  {
    icon: Brain,
    title: "Spaced Repetition",
    description:
      "Science-backed learning system that helps kids remember more with less effort",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description:
      "XP points, daily streaks, achievements and rewards keep kids motivated",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description:
      "Generate custom flashcards and lessons tailored to your child's needs",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description:
      "Track progress, create content, and manage rewards from a powerful dashboard",
    gradient: "from-green-500 to-teal-500",
  },
];

const benefits = [
  "Proven spaced repetition algorithm",
  "Beautiful, kid-friendly interface",
  "Comprehensive progress analytics",
  "Custom content creation tools",
  "AI-powered flashcard generation",
  "Achievement & reward system",
  "Multi-subject learning paths",
  "Safe, ad-free experience",
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Mother of 2",
    content:
      "My kids actually look forward to their daily lessons now! The gamification makes learning fun.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Teacher & Parent",
    content:
      "As an educator, I love the spaced repetition system. As a parent, I love how engaged my daughter is.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "Homeschool Parent",
    content:
      "The AI content generator saves me hours. I can create custom lessons in minutes!",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-800">EduQuest</h1>
                <p className="text-xs text-gray-500">Learn. Play. Grow.</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-800 font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-2 rounded-full hover:shadow-lg transition-shadow"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-full text-sm"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">
              Learning Made
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}
                Magical
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              EduQuest combines Duolingo&apos;s engaging gamification with
              Anki&apos;s proven spaced repetition to help kids ages 6-14 master
              any subject while having fun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="bg-white text-gray-700 font-semibold px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-purple-500 transition-colors flex items-center justify-center"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center text-white font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    10,000+ families
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👦</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Alex</p>
                      <p className="text-sm text-gray-500">Level 12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-gray-800">1,250 XP</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">
                        Daily Streak
                      </span>
                      <span className="text-2xl">🔥</span>
                    </div>
                    <p className="text-3xl font-black text-orange-600">
                      15 Days
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-800">
                        Today&apos;s Progress
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        3/5 lessons
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Mascot mood="celebrating" size="lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4"
            >
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <p className="text-xs font-bold text-gray-800 mt-1">
                New Achievement!
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4"
            >
              <Zap className="w-8 h-8 text-purple-500 fill-purple-500" />
              <p className="text-xs font-bold text-gray-800 mt-1">+50 XP</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Everything Your Child Needs to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for both kids and parents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black text-gray-800 mb-6">
                Why Parents & Kids Love EduQuest
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white"
            >
              <BookOpen className="w-16 h-16 mb-6" />
              <h3 className="text-3xl font-black mb-4">
                Two Powerful Interfaces
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold mb-2">Child App</h4>
                  <p className="text-white/90">
                    Fun, colorful, game-like experience with daily quests,
                    streaks, rewards, and an adorable mascot guide.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Parent Dashboard</h4>
                  <p className="text-white/90">
                    Professional analytics, content creation tools, AI
                    generation, and complete control over your child&apos;s
                    learning journey.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
              Loved by Families Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what parents are saying about EduQuest
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Start Your Learning Adventure Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of families who are making learning fun with
              EduQuest. Free 14-day trial, no credit card required.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/register"
                className="bg-white text-purple-600 font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-shadow text-lg inline-block"
              >
                Get Started Free
              </Link>
            </motion.div>
            <p className="text-white/80 mt-4 text-sm">
              No credit card required &bull; Cancel anytime &bull; 14-day free
              trial
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎓</span>
                </div>
                <span className="font-black text-xl">EduQuest</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making learning magical for kids ages 6-14.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    About
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Pricing
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Features
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Blog
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Careers
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Terms
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Security
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 EduQuest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
