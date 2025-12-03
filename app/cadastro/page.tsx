"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    senha: "",
    phone: "",
    accept_terms: false,
    consent_emails: false,
    selecionarTodos: false,
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function handleInput(e: any) {
    const { name, value, type, checked } = e.target;

    // Lógica do "Selecionar todos"
    if (name === "selecionarTodos") {
      const marcado = checked;
      setForm({
        ...form,
        selecionarTodos: marcado,
        accept_terms: marcado,
        consent_emails: marcado,
      });
      return;
    }

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    if (!form.accept_terms) {
      setMsg("Você deve aceitar os termos para criar a conta.");
      setLoading(false);
      return;
    }

    // 1 — Criar conta no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    });

    if (authError) {
      setMsg("Erro ao criar conta: " + authError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;

    if (!user) {
      setMsg("Erro inesperado: usuário não retornado.");
      setLoading(false);
      return;
    }

    // 2 — Salvar perfil na tabela "profiles"
    // Colunas baseadas na imagem: id, email, name, phone, accept_terms, consent_emails, created_at
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: form.email,
      name: form.name,
      phone: form.phone,
      accept_terms: form.accept_terms,
      consent_emails: form.consent_emails,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      setMsg("Conta criada, mas erro ao salvar perfil: " + profileError.message);
      setLoading(false);
      return;
    }

    setMsg("Conta criada com sucesso! Verifique seu email para confirmar.");
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Criar Conta</h1>

      {msg && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleInput}
          placeholder="Nome completo"
          className="border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInput}
          placeholder="Email"
          className="border p-2 rounded"
          required
        />

        <input
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleInput}
          placeholder="Senha"
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleInput}
          placeholder="Telefone"
          className="border p-2 rounded"
          required
        />

        {/* CHECKBOXES */}
        <div className="flex flex-col gap-2 mt-4 border p-3 rounded">

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="selecionarTodos"
              checked={form.selecionarTodos}
              onChange={handleInput}
            />
            Selecionar todos
          </label>

          <label className="flex items-center gap-2 ml-4">
            <input
              type="checkbox"
              name="accept_terms"
              checked={form.accept_terms}
              onChange={handleInput}
            />
            Aceitar termos de uso
          </label>

          <label className="flex items-center gap-2 ml-4">
            <input
              type="checkbox"
              name="consent_emails"
              checked={form.consent_emails}
              onChange={handleInput}
            />
            Desejo receber emails
          </label>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

      </form>
    </div>
  );
}
