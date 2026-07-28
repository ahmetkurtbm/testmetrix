import { redirect } from "next/navigation";

// Kök adres doğrudan uygulamaya yönlendirir; oturum yoksa middleware araya
// girip /login'e alır. Eskiden burada Login bileşeni doğrudan render ediliyordu.
export default function Home() {
  redirect("/folders");
}
