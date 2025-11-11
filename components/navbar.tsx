"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export const Navbar = () => {
  const [isLogIn, setIsLogIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/session");
        setIsLogIn(res.ok);
      } catch {
        setIsLogIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsLogIn(false);
    router.push("/");
  };

  // for web part
  const getFilteredNavItems = () => {
    return siteConfig.navItems.filter((item) => {
      if (!isLogIn) return false;
      return true;
    });
  };

  // for Ｍ版
  const getFilteredNavMenuItems = () => {
    return siteConfig.navMenuItems.filter((item) => {
      if (!isLogIn) return false;
      return true;
    });
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* logo  導覽頁左邊 */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* 導覽頁右邊 */}
      <NavbarContent
        className="hidden sm:flex basis-1/3 sm:basis-full"
        justify="end"
      >
        <ul className="hidden lg:flex gap-5 justify-start ml-1 mr-10">
          {!isLoading &&
            isLogIn &&
            getFilteredNavItems().map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      isActive && "text-primary-blue2 font-medium"
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              );
            })}
        </ul>

        {/* 登入登出註冊按鈕 */}
        <NavbarItem className="hidden md:flex gap-5 justify-center items-center">
          {isLoading ? (
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : isLogIn ? (
            <Button
              as={Link}
              className="h-10 text-base font-normal text-black border border-gray-1 bg-white hover:bg-primary-blue5"
              href={"/signup"}
              startContent="none"
              variant="flat"
              onPress={handleLogout}
            >
              登出
            </Button>
          ) : (
            <>
              <Button
                as={Link}
                className="h-10 text-base font-normal text-black border border-gray-1 bg-white hover:bg-primary-blue5"
                href={"/signup"}
                startContent="none"
                variant="flat"
              >
                註冊
              </Button>
              <Button
                as={Link}
                className="h-10 text-base font-normal text-white bg-primary-blue2"
                href={"/login"}
                startContent="none"
                variant="flat"
              >
                登入
              </Button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Ｍ版導覽模式 */}
      <NavbarContent className="md:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {!isLoading &&
            siteConfig.navMenuItems
              .filter((item) => {
                if (isLogIn) {
                  return item.label !== "登入" && item.label !== "註冊";
                } else {
                  return item.label !== "登出";
                }
              })
              .map((item, index) => (
                <NavbarMenuItem key={`${item.label}-${index}`}>
                  {item.label === "登出" ? (
                    <Link
                      color="danger"
                      href="#"
                      size="lg"
                      onPress={handleLogout}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link color="foreground" href={item.href} size="lg">
                      {item.label}
                    </Link>
                  )}
                </NavbarMenuItem>
              ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
