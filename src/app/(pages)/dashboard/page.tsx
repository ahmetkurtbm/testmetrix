"use client";

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
    return <p>Loading...</p>;
  }

  //   if (error) {
  //     return <p style={{ color: "red" }}>{error}</p>;
  //   }

  // Öğretmen ve öğrencileri ayırma
  const teachers = users.filter((user) => user.role === "Öğretmen");
  const students = users.filter((user) => user.role === "Öğrenci");

  return (
    <div>
      <h1>Teachers</h1>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher.email}>
            {teacher.name} {teacher.surname} - {teacher.email} - {teacher.phone}{" "}
            - {teacher.university}
          </li>
        ))}
      </ul>

      <h1>Students</h1>
      <ul>
        {students.map((student) => (
          <li key={student.email}>
            {student.name} {student.surname} - {student.email} - {student.phone}{" "}
            - {student.university}
          </li>
        ))}
      </ul>
    </div>
  );
}
