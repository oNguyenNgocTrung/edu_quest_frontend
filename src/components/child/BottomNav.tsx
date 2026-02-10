"use client";

import { motion } from "framer-motion";
import { Home, Gift, BookOpen, Trophy, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    path: "/child/home",
    icon: Home,
    label: "Home",
    activeColor: "#14B8A6",
  },
  {
    path: "/child/rewards",
    icon: Gift,
    label: "Rewards",
    activeColor: "#14B8A6",
    hasNotification: true,
    notificationCount: 3,
  },
  {
    path: "/child/learn",
    icon: BookOpen,
    label: "Learn",
    activeColor: "#7C3AED",
    isPrimary: true,
  },
  {
    path: "/child/leaderboard",
    icon: Trophy,
    label: "Ranks",
    activeColor: "#14B8A6",
  },
  {
    path: "/child/profile",
    icon: User,
    label: "Profile",
    activeColor: "#14B8A6",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div
        className="relative w-full"
        style={{
          height: "64px",
          paddingBottom: "env(safe-area-inset-bottom)",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px -2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          className="mx-auto relative flex items-end justify-around"
          style={{ maxWidth: "375px", height: "64px" }}
        >
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.path);
            const inactiveColor = "#9CA3AF";

            if (item.isPrimary) {
              return (
                <div
                  key={item.path}
                  className="relative flex items-end justify-center"
                  style={{ width: "75px", height: "64px" }}
                >
                  <motion.button
                    onClick={() => router.push(item.path)}
                    whileTap={{ scale: 1.1, y: [0, -4, 0] }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col items-center"
                    style={{ marginBottom: "8px" }}
                  >
                    <motion.div
                      animate={isActive ? { y: [0, -3, 0] } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: "56px",
                        height: "56px",
                        background:
                          "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                        boxShadow:
                          "0 4px 16px rgba(124, 58, 237, 0.4), 0 2px 8px rgba(124, 58, 237, 0.3)",
                      }}
                    >
                      <item.icon
                        strokeWidth={2.5}
                        style={{
                          width: "28px",
                          height: "28px",
                          color: "#FFFFFF",
                        }}
                      />
                    </motion.div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: item.activeColor,
                        marginTop: "4px",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                </div>
              );
            }

            return (
              <motion.button
                key={item.path}
                onClick={() => router.push(item.path)}
                whileTap={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="relative flex flex-col items-center justify-center"
                style={{
                  width: "75px",
                  minHeight: "56px",
                  paddingBottom: "8px",
                }}
              >
                {item.hasNotification &&
                  item.notificationCount &&
                  item.notificationCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute rounded-full flex items-center justify-center"
                      style={{
                        width: "18px",
                        height: "18px",
                        top: "0",
                        right: "12px",
                        background: "#EF4444",
                        boxShadow: "0 2px 6px rgba(239, 68, 68, 0.5)",
                        zIndex: 20,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          lineHeight: "1",
                        }}
                      >
                        {item.notificationCount}
                      </span>
                    </motion.div>
                  )}

                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute rounded-full"
                    style={{
                      width: "48px",
                      height: "36px",
                      backgroundColor: "rgba(20, 184, 166, 0.08)",
                      top: "6px",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <div
                  className="relative flex items-center justify-center"
                  style={{ height: "28px", marginBottom: "4px" }}
                >
                  <item.icon
                    strokeWidth={2.5}
                    fill={isActive ? item.activeColor : "none"}
                    style={{
                      width: "28px",
                      height: "28px",
                      color: isActive ? item.activeColor : inactiveColor,
                      transition: "all 200ms ease-out",
                      position: "relative",
                      zIndex: 10,
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isActive ? item.activeColor : inactiveColor,
                    letterSpacing: "0.2px",
                    transition: "color 200ms ease-out",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
