"use server";
import { cookies } from "next/headers";

export const getCookie = async () => {
  const token = (await cookies()).get("token")?.value;
  return token;
}

export const setCookie = async (token: string) => {
    (await cookies()).set("token", token);
};