"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  university: string;
  phone: string;
  role: string; // "teacher" veya "student"
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/users", {
          method: "GET",
          credentials: "include", // Cookie'leri göndermek için
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized: Please log in.");
          } else {
            throw new Error("Failed to fetch users.");
          }
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p className="text-center text-xl font-semibold">Loading...</p>;
  }

  // Öğretmen ve öğrencileri ayırma
  const teachers = users.filter((user) => user.role === "teacher");
  const students = users.filter((user) => user.role === "student");

  return (
    <div className="container mx-auto p-6 ">
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-100 z-[-1]"
        src="bg-anaekran2.jpg"
      />
      <h1 className="text-2xl font-bold mb-4 text-white text-center">
        Kullanıcılar
      </h1>

      {/* Kullanıcı Tablosu */}
      <table className="w-full border-collapse border border-gray-300 rounded-md bg-slate-500">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Surname</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Phone</th>
            <th className="border border-gray-300 p-2">University</th>
            <th className="border border-gray-300 p-2">Role</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-400 ">
              <td className="border border-gray-300 p-2 text-white">
                {user.name}
              </td>
              <td className="border border-gray-300 p-2  text-white">
                {user.surname}
              </td>
              <td className="border border-gray-300 p-2  text-white">
                {user.email}
              </td>
              <td className="border border-gray-300 p-2  text-white">
                {user.phone}
              </td>
              <td className="border border-gray-300 p-2  text-white">
                {user.university}
              </td>
              <td className="border border-gray-300 p-2 font-semibold">
                {user.role === "Öğretmen"
                  ? "Öğretmen"
                  : user.role === "Yönetici"
                  ? "Yönetici"
                  : "Öğrenci"}
              </td>
              <td className="border border-gray-300 p-2 flex gap-2">
                <Button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 w-full">
                  Düzenle
                </Button>
                <Button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 w-full">
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
