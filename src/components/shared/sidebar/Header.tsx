"use client";
import AuthContext from "@/contexts/authContext/authContext";
import React, { useContext } from "react";
import Logo from "../logo/Logo";

export default function SidebarHeader() {
  const { user } = useContext(AuthContext);
  return (
    <div className="p-6">
      <div className="flex justify-center">
        <div>
          {/* {user && user.company_details && user.company_details.logo ? (
            <img
              src={user.company_details.logo}
              alt="Company Logo"
              className="w-[220px] h-[100px] object-cover"
            />
          ) : ( */}
          <Logo />
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
