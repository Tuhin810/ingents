"use client";
import { ExternalLink } from "lucide-react";
import React from "react";
import { FiMoreVertical } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import { useRouter, useParams } from "next/navigation";

export default function EmailTemplateNav() {
  const router = useRouter();
  const params = useParams() as { site?: string } | null;

  const handleChangeTemplate = () => {
    const site = params?.site;
    const target = site
      ? `/${site}/email-marketing/templates`
      : `/email-marketing/templates`;
    void router.push(target);
  };
  return (
    <div className="bg-white rounded-2xl px-6  pt-6 shadow-sm relative hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Selected Template
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreVertical />
        </button>
      </div>
      <div className="flex items-center space-x-4 mt-4">
        <div className="bg-purple-100 text-gray-600 p-3 rounded-lg">
          <HiOutlineMail size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">Classic</p>
          <p className="text-sm text-gray-500">Used 32 times</p>
        </div>
      </div>
      <div>
        <div className=" text-purple-600 p-3 rounded-lg flex justify-center items-center">
          <img
            className="h-40 w-44 -mt-12 -mr-32"
            src="https://res.cloudinary.com/dshnaupn3/image/upload/v1759853422/Mail_sent-rafiki_p9ofhv.png"
            alt=""
          />
        </div>
      </div>
      <div className="absolute bottom-10 left-6 text-xs text-gray-400">
        <button
          onClick={handleChangeTemplate}
          className="bg-purple-500/80 hover:bg-purple-500 cursor-pointer px-3 py-2 text-base rounded-full text-white text-center"
          aria-label="Change template"
        >
          Change template
        </button>
      </div>
    </div>
  );
}
