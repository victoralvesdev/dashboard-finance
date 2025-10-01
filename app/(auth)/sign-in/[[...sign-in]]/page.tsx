"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/phone-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const SignInPage = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      // Redirect to dashboard (cookie is set by API)
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 p-4 lg:p-0">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center lg:hidden">
            <Image
              src="/logo.svg"
              alt="financify-logo"
              width={150}
              height={150}
            />
          </div>
          <h1 className="font-bold text-3xl text-[#2E2A47]">
            Bem vindo(a) de volta!
          </h1>
          <p className="text-base text-[#7E8CA0]">
            Faça o login com seu número de telefone e senha para acessar o Financify!
          </p>
        </div>
        <div className="flex items-center justify-center mt-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <p className="text-sm text-center text-[#7E8CA0]">
              Não tem uma senha cadastrada?{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="h-full bg-blue-700 hidden lg:flex items-center justify-center">
        <Image src="/logo.svg" alt="financify-logo" width={250} height={250} />
      </div>
    </div>
  );
};

export default SignInPage;
