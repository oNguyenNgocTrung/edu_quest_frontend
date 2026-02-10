import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Star,
  Trophy,
  Heart,
  Flame,
  Coins,
  Lock,
  Check,
  Home,
  BookOpen,
  Gift,
  Award,
  User,
  Calculator,
  Globe,
  Sparkles,
  Search,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  Plus,
  Settings,
  Bell,
  ArrowRight,
} from "lucide-react";

const IconGallery = () => <div />;

const icons = [
  { Icon: Star, label: "Star" },
  { Icon: Trophy, label: "Trophy" },
  { Icon: Heart, label: "Heart" },
  { Icon: Flame, label: "Flame" },
  { Icon: Coins, label: "Coins" },
  { Icon: Lock, label: "Lock" },
  { Icon: Check, label: "Check" },
  { Icon: Home, label: "Home" },
  { Icon: BookOpen, label: "BookOpen" },
  { Icon: Gift, label: "Gift" },
  { Icon: Award, label: "Award" },
  { Icon: User, label: "User" },
  { Icon: Calculator, label: "Calculator" },
  { Icon: Globe, label: "Globe" },
  { Icon: Sparkles, label: "Sparkles" },
  { Icon: Search, label: "Search" },
  { Icon: AlertCircle, label: "AlertCircle" },
  { Icon: TrendingUp, label: "TrendingUp" },
  { Icon: Target, label: "Target" },
  { Icon: Clock, label: "Clock" },
  { Icon: Plus, label: "Plus" },
  { Icon: Settings, label: "Settings" },
  { Icon: Bell, label: "Bell" },
  { Icon: ArrowRight, label: "ArrowRight" },
];

const meta = {
  title: "Design System/Icons",
  component: IconGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => (
    <div>
      <p className="text-sm text-gray-600 mb-6">
        Using <strong>lucide-react</strong> icons throughout the application.
      </p>
      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6">
        {icons.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-purple-100 transition-colors">
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      {[16, 20, 24, 32, 40, 48].map((size) => (
        <div key={size} className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star style={{ width: size, height: size }} className="text-purple-600" />
          </div>
          <span className="text-xs text-gray-500">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const WithColors: Story = {
  render: () => (
    <div className="flex gap-6">
      {[
        { Icon: Star, color: "text-yellow-500", bg: "bg-yellow-100" },
        { Icon: Trophy, color: "text-purple-600", bg: "bg-purple-100" },
        { Icon: Heart, color: "text-red-500", bg: "bg-red-100" },
        { Icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
        { Icon: Coins, color: "text-yellow-600", bg: "bg-yellow-100" },
        { Icon: Check, color: "text-green-600", bg: "bg-green-100" },
      ].map(({ Icon, color, bg }, i) => (
        <div
          key={i}
          className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      ))}
    </div>
  ),
};
