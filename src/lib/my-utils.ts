"use server";
import { cookies } from "next/headers";

export const getCookie = async () => {
  const token = (await cookies()).get("token")?.value;
  return token;
}