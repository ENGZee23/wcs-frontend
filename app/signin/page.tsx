"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Lock, LogIn, Server, User } from "lucide-react";

import { signIn } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      setError("Enter a username and password.");
      return;
    }

    signIn(trimmedUsername);
    router.replace("/");
  }

  return (
    <main className="grid min-h-screen bg-[#080c14] text-slate-100 lg:grid-cols-[1fr_420px]">
      <section className="flex min-h-[320px] flex-col justify-between border-b border-slate-800 px-6 py-6 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase text-slate-500">
              WCS Console
            </div>
            <div className="text-lg font-semibold">Routing Operations</div>
          </div>
        </div>

        <div className="max-w-3xl py-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-300">
            <Activity className="h-3.5 w-3.5" />
            Live socket visibility
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Monitor routing decisions as they happen.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Track PLC requests, WCS responses, confirmations, and exceptions from a focused operations dashboard.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-slate-400 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="font-semibold text-slate-200">SignalR</div>
            <div className="mt-1">Real-time dashboard updates</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="font-semibold text-slate-200">SQL Log</div>
            <div className="mt-1">Persistent transaction history</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="font-semibold text-slate-200">Socket Server</div>
            <div className="mt-1">RTREQ, RTRSP, RTCNF, HBEAT flow</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold">Sign In</h2>
            <p className="mt-2 text-sm text-slate-400">
              Access the live WCS dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-800 bg-slate-900/90 p-5 shadow-sm"
          >
            <label className="block text-sm font-medium text-slate-300">
              Username
              <span className="mt-2 flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus-within:border-blue-500">
                <User className="h-4 w-4 text-slate-500" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                  placeholder="operator"
                />
              </span>
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-300">
              Password
              <span className="mt-2 flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus-within:border-blue-500">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  type="password"
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                  placeholder="Password"
                />
              </span>
            </label>

            {error && (
              <div className="mt-4 rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
