import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cookies } from "next/headers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCookie = async () => {
  const token = (await cookies()).get("token")?.value;
  return token;
}