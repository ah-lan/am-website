"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Team = {
  id: string;
  name: string;
  logo_url: string | null;
  founded_year: number | null;
  created_at: string;
};

const emptyForm = { name: "", foundedYear: "" };

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userName, setUserName] = useState("there");
  const [isManager, setIsManager] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTeams() {
      if (!supabase) {
        router.replace("/");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, status")
        .eq("id", user.id)
        .single();

      setUserName(profile?.name || user.email?.split("@")[0] || "there");
      setIsManager(profile?.role === "manager");
      setIsApproved(profile?.status === "approved");

      const { data: teamData, error } = await supabase
        .from("teams")
        .select("id, name, logo_url, founded_year, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage("Teams are not available yet. Run the Sprint 2 SQL migrations first.");
      } else {
        setTeams(teamData ?? []);
      }

      setIsLoading(false);
    }

    void loadTeams().catch(() => {
      setErrorMessage("We could not load teams right now.");
      setIsLoading(false);
    });
  }, [router]);

  function resetForm() {
    setForm(emptyForm);
    setLogoFile(null);
    setEditingTeamId(null);
    setIsFormOpen(false);
  }

  function startEditingTeam(team: Team) {
    setEditingTeamId(team.id);
    setForm({ name: team.name, foundedYear: team.founded_year?.toString() ?? "" });
    setLogoFile(null);
    setErrorMessage("");
    setIsFormOpen(true);
  }

  async function handleSaveTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!supabase || !isManager || !isApproved) {
      setErrorMessage("Only approved turf managers can manage teams.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.replace("/");
      return;
    }

    setIsSaving(true);
    let logoUrl: string | null = null;

    if (logoFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(logoFile.type)) {
        setErrorMessage("Choose a JPG, PNG, or WebP image.");
        setIsSaving(false);
        return;
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        setErrorMessage("Team logos must be 5 MB or smaller.");
        setIsSaving(false);
        return;
      }

      const extension = logoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, logoFile, { contentType: logoFile.type, upsert: false });

      if (uploadError) {
        setErrorMessage("We could not upload that logo. Run the storage migration and try again.");
        setIsSaving(false);
        return;
      }

      logoUrl = supabase.storage.from("team-logos").getPublicUrl(filePath).data.publicUrl;
    }

    const values = {
      name: form.name.trim(),
      founded_year: form.foundedYear ? Number(form.foundedYear) : null,
      ...(logoFile ? { logo_url: logoUrl } : {}),
    };
    const query = editingTeamId
      ? supabase.from("teams").update(values).eq("id", editingTeamId)
      : supabase.from("teams").insert({ ...values, manager_id: user.id });
    const { data: savedTeam, error } = await query
      .select("id, name, logo_url, founded_year, created_at")
      .single();

    if (error) {
      setErrorMessage(error.message);
    } else if (savedTeam) {
      setTeams((currentTeams) => editingTeamId
        ? currentTeams.map((team) => team.id === editingTeamId ? savedTeam : team)
        : [savedTeam, ...currentTeams]);
      resetForm();
    }

    setIsSaving(false);
  }

  async function handleDeleteTeam(teamId: string) {
    if (!supabase || !window.confirm("Delete this team?")) return;

    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTeams((currentTeams) => currentTeams.filter((team) => team.id !== teamId));
  }

  if (isLoading) return <main className="dashboard-loading">Loading teams...</main>;

  return (
    <main className="teams-shell">
      <header className="teams-header">
        <Link className="dashboard-brand teams-brand" href="/dashboard"><span className="brand-mark">AM</span><span>AM SPORTS</span></Link>
        <Link className="back-link" href="/dashboard">Dashboard</Link>
      </header>
      <section className="teams-content">
        <div className="teams-intro">
          <div>
            <p className="dashboard-eyebrow">{isManager ? "TEAM MANAGEMENT" : "LEAGUE TEAMS"}</p>
            <h1>{isManager ? `Build your squad, ${userName}.` : `Explore teams, ${userName}.`}</h1>
            <p>{isManager ? "Keep your league identity together in one place." : "Browse all registered teams across the league."}</p>
          </div>
          {isManager && isApproved && <button className="primary-action" onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)}>{isFormOpen ? "Close form" : "Add a team"}<span>{isFormOpen ? "−" : "+"}</span></button>}
        </div>

        {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
        {isManager && !isApproved && <div className="team-notice"><strong>Manager approval required</strong><p>Your team tools will unlock after your manager account is approved.</p></div>}

        {isFormOpen && isManager && isApproved && <form className="team-form" onSubmit={handleSaveTeam}>
          <div className="team-form-heading"><p className="dashboard-eyebrow">{editingTeamId ? "EDIT TEAM" : "NEW TEAM"}</p><h2>{editingTeamId ? "Update your team" : "Add your team"}</h2></div>
          <label><span>Team name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={80} placeholder="e.g. Kampala Strikers" required /></label>
          <div className="team-form-grid"><label><span>Founded year <small>(optional)</small></span><input type="number" value={form.foundedYear} onChange={(event) => setForm({ ...form, foundedYear: event.target.value })} min="1800" max={new Date().getFullYear()} placeholder="2026" /></label><label><span>Team logo <small>(optional, JPG/PNG/WebP, max 5 MB)</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} /></label></div>
          <div className="team-form-actions"><button className="submit-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingTeamId ? "Save changes" : "Create team"}<span>↗</span></button>{editingTeamId && <button className="text-button" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>}

        <div className="team-list-heading"><div><p className="dashboard-eyebrow">TEAMS</p><h2>{teams.length ? `${teams.length} ${teams.length === 1 ? "team" : "teams"}` : "No teams yet"}</h2></div></div>
        {teams.length ? <div className="teams-grid">{teams.map((team) => <article className="team-card" key={team.id}>{team.logo_url ? <div className="team-logo" role="img" aria-label={`${team.name} logo`} style={{ backgroundImage: `url(${team.logo_url})` }} /> : <div className="team-placeholder">{team.name.slice(0, 1).toUpperCase()}</div>}<div className="team-card-copy"><h3>{team.name}</h3><p>{team.founded_year ? `Founded ${team.founded_year}` : "Foundation year not added"}</p></div>{isManager && isApproved && <div className="team-card-actions"><button className="icon-action" onClick={() => startEditingTeam(team)} aria-label={`Edit ${team.name}`}>Edit</button><button className="icon-action" onClick={() => handleDeleteTeam(team.id)} aria-label={`Delete ${team.name}`}>Delete</button></div>}</article>)}</div> : <div className="empty-team-state"><span>+</span><h3>{isManager ? "Start with your first team" : "No teams registered yet"}</h3><p>{isManager ? "Teams make it easier to organize players, fixtures, and league progress." : "League teams will appear here once registered by managers."}</p>{isManager && isApproved && <button className="text-action" onClick={() => setIsFormOpen(true)}>Create a team <span>→</span></button>}</div>}
      </section>
    </main>
  );
}
