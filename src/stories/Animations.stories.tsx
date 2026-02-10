import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { motion } from "framer-motion";
import { Star, Trophy, Sparkles } from "lucide-react";

const AnimationShowcase = () => <div />;

const meta = {
  title: "Design System/Animations",
  component: AnimationShowcase,
  tags: ["autodocs"],
} satisfies Meta<typeof AnimationShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HoverAndTap: Story = {
  render: () => (
    <div className="text-center p-8">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-3 cursor-pointer flex items-center justify-center"
      >
        <Star className="w-10 h-10 text-white fill-white" />
      </motion.div>
      <p className="text-sm font-semibold text-gray-700">
        Hover to scale + rotate, click to squish
      </p>
    </div>
  ),
};

export const Floating: Story = {
  render: () => (
    <div className="text-center p-8">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mx-auto mb-3 flex items-center justify-center"
      >
        <Trophy className="w-10 h-10 text-white fill-white" />
      </motion.div>
      <p className="text-sm font-semibold text-gray-700">
        Continuous floating animation
      </p>
    </div>
  ),
};

export const Spinning: Story = {
  render: () => (
    <div className="text-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mx-auto mb-3 flex items-center justify-center"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      <p className="text-sm font-semibold text-gray-700">
        Continuous spin animation
      </p>
    </div>
  ),
};

export const Shimmer: Story = {
  render: () => (
    <div className="text-center p-8">
      <div className="relative w-64 h-16 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl mx-auto mb-3 overflow-hidden border border-orange-200">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
          style={{ width: "50%" }}
        />
        <div className="relative z-10 h-full flex items-center justify-center">
          <span className="text-sm font-bold text-orange-700">
            Shimmer Effect
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700">
        Attention-grabbing shimmer overlay
      </p>
    </div>
  ),
};
