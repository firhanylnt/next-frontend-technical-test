"use client";
import useAuthStore from "@/stores/auth-store";
import { getCookie } from "cookies-next";
import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

type Token = {
  id: number;
  fullname: string;
  exp: number;
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { onAuthSuccess, clearAuth } = useAuthStore();
  const access_token = getCookie("access_token") || "";

  const checkLogin = async () => {
    const token: Token = jwtDecode(access_token);

    if (Date.now() >= token.exp * 1000) {
      Swal.fire({
        icon: "warning",
        title: "Session expired please relogin",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => clearAuth());
    } else {
      onAuthSuccess({ id: token.id, fullname: token.fullname});
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (access_token) {
        checkLogin();
      }
    }
  }, []);
  return <>{children}</>;
}