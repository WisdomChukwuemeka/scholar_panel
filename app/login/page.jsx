"use client";
// app/login/page.js   ← SERVER COMPONENT (no redirect check)
import Login from "@/components/login";

export default function LoginPage() {
  return <Login redirect="/" />;   // or whatever you want
}