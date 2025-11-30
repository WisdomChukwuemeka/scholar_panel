// app/login/page.jsx
import Login from "../components/login";

export default async function LoginPage({ searchParams }) {
  const resolved = await searchParams;                // ✅ FIX
  const redirect = resolved?.redirect || "/";         // safe

  return (
    <div className="max-w-lg mx-auto mt-20">
      <Login redirect={redirect} />
    </div>
  );
}
