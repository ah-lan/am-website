"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Team = { id: string; name: string };

type Player = {
  id: string;
  team_id: string;
  team_name?: string;
  name: string;
  position: string;
  jersey_number: number;
  photo_url: string | null;
};

const positions = ["GK", "DEF", "MID", "FWD"];
const emptyForm = { name: "", position: "MID", jerseyNumber: "" };

export default function PlayersPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<"ALL" | "GK" | "DEF" | "MID" | "FWD">("ALL");
  const [activePlayerModal, setActivePlayerModal] = useState<Player | null>(null);

  const [isManager, setIsManager] = useState(false);
  const [isApprovedManager, setIsApprovedManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRoster() {
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

      const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", user.id).single();
      const manager = profile?.role === "manager";
      const approvedManager = manager && profile?.status === "approved";
      setIsManager(manager);
      setIsApprovedManager(approvedManager);

      const { data: teamData, error: teamError } = await supabase.from("teams").select("id, name").order("name");
      if (teamError) {
        setErrorMessage("Teams are not available yet. Run the Sprint 2 migrations first.");
      } else {
        setTeams(teamData ?? []);
        if (approvedManager && teamData?.[0]) {
          setSelectedTeamId(teamData[0].id);
        } else {
          setSelectedTeamId("ALL");
        }
      }
      setIsLoading(false);
    }

    void loadRoster().catch(() => {
      setErrorMessage("We could not load the roster right now.");
      setIsLoading(false);
    });
  }, [router]);

  useEffect(() => {
    async function loadPlayers() {
      if (!supabase) {
        setPlayers([]);
        return;
      }

      setErrorMessage("");

      if (selectedTeamId === "ALL" || !selectedTeamId) {
        const { data, error } = await supabase
          .from("players")
          .select("id, team_id, name, position, jersey_number, photo_url, teams(name)")
          .order("jersey_number");

        if (error) {
          setErrorMessage("Players are not available yet. Run backend/sql/004_players.sql first.");
        } else {
          const mapped = (data ?? []).map((row: any) => ({
            id: row.id,
            team_id: row.team_id,
            team_name: row.teams?.name || "League Squad",
            name: row.name,
            position: row.position,
            jersey_number: row.jersey_number,
            photo_url: row.photo_url,
          }));
          setPlayers(mapped);
        }
      } else {
        const selectedTeam = teams.find((t) => t.id === selectedTeamId);
        const { data, error } = await supabase
          .from("players")
          .select("id, team_id, name, position, jersey_number, photo_url")
          .eq("team_id", selectedTeamId)
          .order("jersey_number");

        if (error) {
          setErrorMessage("Players are not available yet. Run backend/sql/004_players.sql first.");
        } else {
          const mapped = (data ?? []).map((p: any) => ({
            ...p,
            team_name: selectedTeam?.name || "Team Squad",
          }));
          setPlayers(mapped);
        }
      }
    }

    void loadPlayers();
  }, [selectedTeamId, teams]);

  function resetForm() {
    setForm(emptyForm);
    setPhotoFile(null);
    setEditingPlayerId(null);
    setIsFormOpen(false);
  }

  function startEditingPlayer(player: Player) {
    setEditingPlayerId(player.id);
    setForm({ name: player.name, position: player.position, jerseyNumber: String(player.jersey_number) });
    setPhotoFile(null);
    setIsFormOpen(true);
    setErrorMessage("");
  }

  async function handleSavePlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (!supabase || !isApprovedManager || !selectedTeamId || selectedTeamId === "ALL") {
      setErrorMessage("Select a specific team first before managing player rosters.");
      return;
    }

    setIsSaving(true);
    let photoUrl: string | null = null;
    if (photoFile) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(photoFile.type)) {
        setErrorMessage("Choose a JPG, PNG, or WebP image.");
        setIsSaving(false);
        return;
      }
      if (photoFile.size > 5 * 1024 * 1024) {
        setErrorMessage("Player photos must be 5 MB or smaller.");
        setIsSaving(false);
        return;
      }
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        router.replace("/");
        setIsSaving(false);
        return;
      }
      const extension = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("player-photos")
        .upload(filePath, photoFile, { contentType: photoFile.type, upsert: false });

      if (uploadError) {
        setErrorMessage("We could not upload that photo. Run the player photo storage migration and try again.");
        setIsSaving(false);
        return;
      }
      photoUrl = supabase.storage.from("player-photos").getPublicUrl(filePath).data.publicUrl;
    }

    const values = {
      team_id: selectedTeamId,
      name: form.name.trim(),
      position: form.position,
      jersey_number: Number(form.jerseyNumber),
      ...(photoFile ? { photo_url: photoUrl } : {}),
    };
    const query = editingPlayerId
      ? supabase.from("players").update(values).eq("id", editingPlayerId)
      : supabase.from("players").insert(values);
    const { data: savedPlayer, error } = await query
      .select("id, team_id, name, position, jersey_number, photo_url")
      .single();

    if (error) {
      setErrorMessage(error.message);
    } else if (savedPlayer) {
      const selectedTeam = teams.find((t) => t.id === selectedTeamId);
      const withTeam = { ...savedPlayer, team_name: selectedTeam?.name || "Team Squad" };
      setPlayers((currentPlayers) =>
        editingPlayerId
          ? currentPlayers.map((player) => (player.id === editingPlayerId ? withTeam : player))
          : [...currentPlayers, withTeam].sort((a, b) => a.jersey_number - b.jersey_number),
      );
      resetForm();
    }
    setIsSaving(false);
  }

  async function handleDeletePlayer(playerId: string) {
    if (!supabase || !window.confirm("Remove this player from the roster?")) return;
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) setErrorMessage(error.message);
    else setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== playerId));
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      player.name.toLowerCase().includes(query) ||
      String(player.jersey_number) === query ||
      (player.team_name && player.team_name.toLowerCase().includes(query));
    const matchesPosition = positionFilter === "ALL" || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const gkCount = players.filter((p) => p.position === "GK").length;
  const defCount = players.filter((p) => p.position === "DEF").length;
  const midCount = players.filter((p) => p.position === "MID").length;
  const fwdCount = players.filter((p) => p.position === "FWD").length;

  if (isLoading) return <main className="dashboard-loading">Loading players...</main>;

  return (
    <main className="teams-shell">
      <header className="teams-header">
        <Link className="dashboard-brand teams-brand" href="/dashboard">
          <span className="brand-mark">AM</span>
          <span>AM SPORTS</span>
        </Link>
        <Link className="back-link" href="/teams">
          Teams
        </Link>
      </header>

      <section className="teams-content">
        <div className="teams-intro">
          <div>
            <p className="dashboard-eyebrow">{isManager ? "PLAYER MANAGEMENT" : "LEAGUE ROSTERS"}</p>
            <h1>{isManager ? "Build your roster." : "Browse team rosters."}</h1>
            <p>
              {isManager
                ? "Manage the players representing your team."
                : "Browse player rosters across all registered league teams."}
            </p>
          </div>
          {isApprovedManager && selectedTeamId && selectedTeamId !== "ALL" && (
            <button className="primary-action" onClick={() => (isFormOpen ? resetForm() : setIsFormOpen(true))}>
              {isFormOpen ? "Close form" : "Add player"}
              <span>{isFormOpen ? "−" : "+"}</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="auth-error" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Filter and Search controls */}
        <div className="players-filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search player name, jersey # or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>

          <div className="position-filter-group" role="tablist" aria-label="Filter players by position">
            <button
              className={`filter-pill ${positionFilter === "ALL" ? "active" : ""}`}
              onClick={() => setPositionFilter("ALL")}
            >
              All <span className="count">{players.length}</span>
            </button>
            <button
              className={`filter-pill ${positionFilter === "GK" ? "active" : ""}`}
              onClick={() => setPositionFilter("GK")}
            >
              GK <span className="count">{gkCount}</span>
            </button>
            <button
              className={`filter-pill ${positionFilter === "DEF" ? "active" : ""}`}
              onClick={() => setPositionFilter("DEF")}
            >
              DEF <span className="count">{defCount}</span>
            </button>
            <button
              className={`filter-pill ${positionFilter === "MID" ? "active" : ""}`}
              onClick={() => setPositionFilter("MID")}
            >
              MID <span className="count">{midCount}</span>
            </button>
            <button
              className={`filter-pill ${positionFilter === "FWD" ? "active" : ""}`}
              onClick={() => setPositionFilter("FWD")}
            >
              FWD <span className="count">{fwdCount}</span>
            </button>
          </div>
        </div>

        <label className="team-select-label">
          <span>Team roster filter</span>
          <select
            value={selectedTeamId}
            onChange={(event) => {
              setSelectedTeamId(event.target.value);
              resetForm();
            }}
          >
            <option value="ALL">All League Teams ({teams.length} teams)</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        {/* Squad Breakdown Bar */}
        {players.length > 0 && (
          <div className="squad-summary-bar">
            <strong>{selectedTeamId === "ALL" ? "League Squad Overview" : selectedTeam?.name}</strong>
            <div className="squad-breakdown">
              <span>
                <span className="position-badge gk">GK</span> {gkCount}
              </span>
              <span>
                <span className="position-badge def">DEF</span> {defCount}
              </span>
              <span>
                <span className="position-badge mid">MID</span> {midCount}
              </span>
              <span>
                <span className="position-badge fwd">FWD</span> {fwdCount}
              </span>
            </div>
          </div>
        )}

        {/* Manager Add/Edit Form */}
        {isFormOpen && isApprovedManager && selectedTeamId !== "ALL" && (
          <form className="team-form" onSubmit={handleSavePlayer}>
            <div className="team-form-heading">
              <p className="dashboard-eyebrow">{editingPlayerId ? "EDIT PLAYER" : "NEW PLAYER"}</p>
              <h2>{editingPlayerId ? "Update player" : "Add player"}</h2>
            </div>
            <div className="team-form-grid">
              <label>
                <span>Player name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  minLength={2}
                  maxLength={80}
                  placeholder="e.g. Brian Kato"
                  required
                />
              </label>
              <label>
                <span>Position</span>
                <select value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })}>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>Jersey number</span>
              <input
                type="number"
                value={form.jerseyNumber}
                onChange={(event) => setForm({ ...form, jerseyNumber: event.target.value })}
                min="1"
                max="99"
                required
              />
            </label>
            <label>
              <span>
                Player photo <small>(optional, JPG/PNG/WebP, max 5 MB)</small>
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="team-form-actions">
              <button className="submit-button" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingPlayerId ? "Save changes" : "Add player"}
                <span>↗</span>
              </button>
              {editingPlayerId && (
                <button className="text-button" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="team-list-heading">
          <p className="dashboard-eyebrow">{selectedTeamId === "ALL" ? "LEAGUE SQUAD" : selectedTeam?.name ?? "ROSTER"}</p>
          <h2>
            {filteredPlayers.length
              ? `${filteredPlayers.length} ${filteredPlayers.length === 1 ? "player" : "players"}`
              : "No matching players"}
          </h2>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length ? (
          <div className="players-grid">
            {filteredPlayers.map((player) => (
              <article
                className="player-card"
                key={player.id}
                onClick={() => setActivePlayerModal(player)}
              >
                <div className="player-card-media">
                  <div className="player-card-overlay-top">
                    <span className={`position-badge ${player.position.toLowerCase()}`}>
                      {player.position}
                    </span>
                    <span className="player-card-number-badge">
                      #{player.jersey_number}
                    </span>
                  </div>

                  {player.photo_url ? (
                    <div
                      className="player-card-photo"
                      role="img"
                      aria-label={`${player.name} full view photo`}
                      style={{ backgroundImage: `url("${player.photo_url}")` }}
                    />
                  ) : (
                    <div className="player-card-jersey-fallback">
                      <strong>#{player.jersey_number}</strong>
                      <span>{player.position}</span>
                    </div>
                  )}
                </div>

                <div className="player-card-body">
                  <h3>{player.name}</h3>
                  <span className="player-card-team">{player.team_name || "League Team"}</span>

                  {isApprovedManager && selectedTeamId !== "ALL" && (
                    <div className="player-card-footer">
                      <button
                        className="icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingPlayer(player);
                        }}
                        aria-label={`Edit ${player.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeletePlayer(player.id);
                        }}
                        aria-label={`Remove ${player.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-team-state">
            <span>+</span>
            <h3>{searchQuery || positionFilter !== "ALL" ? "No players match your search filter" : isManager ? "Your roster is waiting" : "No players in this roster yet"}</h3>
            <p>
              {searchQuery || positionFilter !== "ALL"
                ? "Try adjusting your search terms or clearing position filters."
                : isManager
                ? "Add players to start building your team."
                : "Player details will appear here once added by team managers."}
            </p>
            {isApprovedManager && selectedTeamId && selectedTeamId !== "ALL" && !searchQuery && (
              <button className="text-action" onClick={() => setIsFormOpen(true)}>
                Add a player <span>→</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Player Detail Modal */}
      {activePlayerModal && (
        <div
          className="player-modal-backdrop"
          onClick={() => setActivePlayerModal(null)}
        >
          <div
            className="player-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={() => setActivePlayerModal(null)}
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="modal-full-photo-wrap">
              {activePlayerModal.photo_url ? (
                <div
                  className="modal-full-photo"
                  role="img"
                  aria-label={`${activePlayerModal.name} full view photo`}
                  style={{ backgroundImage: `url("${activePlayerModal.photo_url}")` }}
                />
              ) : (
                <div className="player-card-jersey-fallback">
                  <strong>#{activePlayerModal.jersey_number}</strong>
                  <span>{activePlayerModal.position}</span>
                </div>
              )}
            </div>

            <div className="modal-player-hero">
              <h2>{activePlayerModal.name}</h2>
              <span className={`position-badge ${activePlayerModal.position.toLowerCase()}`}>
                {activePlayerModal.position}
              </span>
            </div>

            <div className="modal-details-grid">
              <div className="modal-detail-item">
                <label>Team</label>
                <span>{activePlayerModal.team_name || "League Team"}</span>
              </div>
              <div className="modal-detail-item">
                <label>Jersey Number</label>
                <span>#{activePlayerModal.jersey_number}</span>
              </div>
              <div className="modal-detail-item">
                <label>Position</label>
                <span>{activePlayerModal.position}</span>
              </div>
              <div className="modal-detail-item">
                <label>Roster Status</label>
                <span>Active Squad</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}