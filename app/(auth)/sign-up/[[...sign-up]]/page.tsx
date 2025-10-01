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

const SignUpPage = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
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
        setError(data.error || "Erro ao fazer cadastro");
        setLoading(false);
        return;
      }

      // Redirect to dashboard (cookie is set by API)
      router.push("/");
    } catch (err) {
      console.error("Register error:", err);
      setError("Erro ao fazer cadastro. Tente novamente.");
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
          <h1 className="font-bold text-3xl text-[#2E2A47]">Bem vindo(a)!</h1>
          <p className="text-base text-[#7E8CA0]">
            Cadastre sua senha para acessar o Financify e gerenciar suas finanças!
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
              <p className="text-xs text-[#7E8CA0]">
                Digite o número cadastrado no sistema
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite sua senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar senha"
              )}
            </Button>

            <p className="text-sm text-center text-[#7E8CA0]">
              Já tem uma senha cadastrada?{" "}
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Faça login aqui
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

export default SignUpPage;
