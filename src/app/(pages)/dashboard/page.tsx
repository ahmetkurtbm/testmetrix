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

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4 sm:px-6 lg:px-8">
      <img
        className="fixed inset-0 w-full h-full object-cover opacity-10 z-[-1]"
        src="bg-anaekran.jpg"
        alt="background"
      />

      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 sm:mb-0">
            Kullanıcılar
          </h1>
          <div className="flex gap-3">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Yeni Kullanıcı
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Excel İndir
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow">
          <div className="align-middle inline-block min-w-full">
            <div className="overflow-hidden sm:rounded-lg bg-white/10 backdrop-blur-sm">
              <table className="min-w-full divide-y divide-gray-600">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      İsim
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Soyisim
                    </th>
                    <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Email
                    </th>
                    <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Üniversite
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-black uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.surname}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.email}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.phone}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.university}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "teacher"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "teacher" ? "Öğretmen" : "Öğrenci"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs">
                            Düzenle
                          </Button>
                          <Button className="bg-red-600 hover:bg-red-700 px-3 py-1 text-xs">
                            Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
