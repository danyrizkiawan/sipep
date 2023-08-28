"use client";
import { useEffect, useState } from "react";

import PageHeader from "../components/PageHeader";
import { Spinner } from "../components/Loader";
import { fetchAPI } from "../utils/fetch-api";
import { useRouter } from "next/navigation";
import { getUser, setToken, setUser } from "../utils/session";
import { useUser } from "../utils/auth-context";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setLoading] = useState(false);
    const { user, login } = useUser();
    const router = useRouter();

    async function handleSubmit(event: any) {
        event.preventDefault();
        if (username === "") {
          setErrorMessage("Username wajib diisi.");
          return;
        } else if (password === "") {
          setErrorMessage("Password wajib diisi.");
          return;
        }
        
        setLoading(true);
        setErrorMessage("");
        const data = await fetchAPI("/auth/local", {populate: '*'}, {
            method: "POST",
            body: JSON.stringify({ identifier: username, password }),
        });
        setLoading(false);

        if (!data.jwt) {
            setErrorMessage("Login gagal. Username atau password salah.");
            setPassword("");
            return;
        }
        setToken(data.jwt);

        const user = await getUser()
        if (!user) {
            setErrorMessage("Login gagal. User tidak ditemukan.");
            setPassword("");
            return;
        }
        setUser(user);
        login(user);
        router.replace('/evaluation');
    }

    useEffect(() => {
        if (user) {
            router.replace('/evaluation');
        }
    }, [user])

    return (
        <div>
            <PageHeader heading="Login dengan username" text="Akses menu lebih lengkap" />
            <div className="flex justify-center">
                <div className="container shadow-2xl px-4 py-2 sm:p-20 w-3/4 sm:w-1/2 rounded-md ">
                    {errorMessage && (
                        <p className="text-red-500 bg-red-200 px-4 py-2 rounded-lg my-3">
                            {errorMessage}
                        </p>
                    )}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Masukkan username"
                            className="px-4 py-2 my-3 form-input w-full rounded-lg"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                        />
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            className="px-4 py-2 my-3 form-input w-full rounded-lg"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 my-3 w-full font-semibold rounded-md bg-violet-400 text-gray-100"
                        >
                            {
                                isLoading ? (
                                    <Spinner />
                                ): ("Login")
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
