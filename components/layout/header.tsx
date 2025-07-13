"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Badge } from "../ui/badge";
import { NotificationsMenu } from "../ui/notifications-menu";
import { Menu, X } from "lucide-react"; // Import icons for mobile menu

const Header = ({
  showLogin,
  showLogout,
}: {
  showLogin?: boolean;
  showLogout?: boolean;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user type badge color and text
  const getUserTypeBadge = () => {
    if (user?.userType === "authority") {
      return {
        color: "bg-amber-500 hover:bg-amber-600",
        text: "Authority",
      };
    }
    return {
      color: "bg-blue-500 hover:bg-blue-600",
      text: "Citizen",
    };
  };

  const handleLogout = async () => {
    try {
      // Set logout flag before signing out
      localStorage.setItem("isLogout", "true");

      await signOut(auth);
      // Clear cookies
      Cookies.remove("authToken");
      Cookies.remove("userType");

      // Clear other stored user data
      localStorage.removeItem("userType");

      // Redirect to home page
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Determine dashboard URL based on user type
  const getDashboardUrl = () => {
    if (user?.userType === "authority") {
      return "/authority/dashboard";
    }
    return "/citizen/dashboard";
  };

  return (
    <header className="border-b bg-[#003A70] text-white relative">
      <div className="container mx-auto px-4 py-3">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          {/* Logo and title - stack on very small screens */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 w-12 md:h-14 md:w-14 bg-white rounded-full flex items-center justify-center shrink-0">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-[#003A70] rounded-full flex items-center justify-center text-white font-bold text-xs">
                NAGRIK
              </div>
            </div>
            <div className="max-w-[200px] md:max-w-none">
              <div className="text-[10px] md:text-xs">
                Smart Infrastructure Governance
              </div>
              <div className="font-bold text-sm md:text-lg">
                Legislative & Policy Insight Platform
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              // Show user info and logout button if user is logged in
              <div className="flex items-center gap-3">
                {/* Notifications menu */}
                {user.userType === "citizen" && (
                  <div className="mr-2">
                    <NotificationsMenu />
                  </div>
                )}

                <div className="text-sm text-right">
                  <div className="font-medium flex items-center gap-2 flex-wrap justify-end">
                    <span className="truncate max-w-[150px]">
                      {user.username || user.email}
                    </span>
                    <Badge
                      className={`${
                        getUserTypeBadge().color
                      } text-white text-xs`}
                    >
                      {getUserTypeBadge().text}
                    </Badge>
                  </div>{" "}
                  <div className="text-xs opacity-80">
                    {" "}
                    {user?.userType === "authority" &&
                    user?.state &&
                    user?.city ? (
                      <span className="truncate">
                        {typeof user.city === "object" && user.city !== null
                          ? user.city.name
                          : user.city}
                        ,
                        {typeof user.state === "object" && user.state !== null
                          ? user.state.name
                          : user.state}
                      </span>
                    ) : (
                      <span>Account ID: {user.uid?.substring(0, 8)}</span>
                    )}
                  </div>
                </div>
                <Link href={getDashboardUrl()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white"
                  >
                    Dashboard
                  </Button>
                </Link>
                {showLogout !== false && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            ) : (
              // Show login button if user is not logged in
              showLogin !== false && (
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile menu (collapsible) */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-white/20 mt-3 animate-in fade-in slide-in-from-top">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <span className="truncate max-w-[200px]">
                        {user.username || user.email}
                      </span>
                      <Badge
                        className={`${
                          getUserTypeBadge().color
                        } text-white text-xs`}
                      >
                        {getUserTypeBadge().text}
                      </Badge>
                    </div>{" "}
                    <div className="text-xs opacity-80">
                      {" "}
                      {user.userType === "authority" &&
                      user?.state &&
                      user?.city ? (
                        <span className="truncate max-w-[200px] inline-block">
                          {typeof user.city === "object" && user.city !== null
                            ? user.city.name
                            : user.city}
                          ,
                          {typeof user.state === "object" && user.state !== null
                            ? user.state.name
                            : user.state}
                        </span>
                      ) : (
                        <span>Account ID: {user.uid?.substring(0, 8)}</span>
                      )}
                    </div>
                  </div>

                  {/* Notifications for mobile */}
                  {user.userType === "citizen" && <NotificationsMenu />}
                </div>

                <div className="flex flex-col space-y-2">
                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white w-full"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  {showLogout !== false && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white w-full"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              showLogin !== false && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white bg-inherit hover:bg-[#004d94] hover:text-white w-full"
                  >
                    Login
                  </Button>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
