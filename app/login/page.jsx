import Login from "../components/login";

export default function LoginPage({ searchParams }) {
  const redirect = searchParams.redirect || "/";

  return (
    <div className="max-w-lg mx-auto mt-20">
      <Login redirect={redirect} />
    </div>
  );
}