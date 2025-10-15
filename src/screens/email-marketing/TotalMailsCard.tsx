"use client";
import { ExternalLink } from "lucide-react";
import React from "react";
import { FiMoreVertical } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";

export default function TotalMailsCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm relative hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Total Mails</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreVertical />
        </button>
      </div>
      <div className="flex items-center space-x-4 mt-4">
        <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
          <HiOutlineMail size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">150</p>
          <p className="text-sm text-gray-500">July</p>
        </div>
      </div>
      <div>
        <div className=" text-purple-600 p-3 rounded-lg flex justify-center items-center">
          <ExternalLink size={34} />
        </div>
      </div>
      <p className="absolute bottom-4 left-6 text-xs text-gray-400">20k</p>
    </div>
  );
}
