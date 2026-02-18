"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getCronSettings,
    updateCronSettings,
    listPlatformCredentials,
    savePlatformCredential,
    deletePlatformCredential,
    testPlatformCredential,
    getGoogleDriveConfig,
    updateGoogleDriveConfig,
    disconnectGoogleDrive,
    listLLMProviders,
    saveLLMProviderKey,
    deleteLLMProviderKey,
    testLLMProvider,
    listAgentModelConfigs,
    assignAgentModel,
    resetAgentModel,
    type CronSettings,
    type PlatformCredential,
    type GoogleDriveConfig,
    type LLMProvider,
    type AgentModelConfig,
} from "@/lib/api";

// ─── Constants ──────────────────────────────────────────────────────────────

const TABS = [
    { id: "cron", label: "Cron Jobs", icon: "⏰" },
    { id: "platforms", label: "Social Media", icon: "🔗" },
    { id: "drive", label: "Google Drive", icon: "📁" },
    { id: "aimodels", label: "AI Models", icon: "🧠" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMEZONES = [
    "Asia/Kolkata", "America/New_York", "America/Chicago", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo",
    "Asia/Singapore", "Australia/Sydney", "Pacific/Auckland", "UTC",
];

const PLATFORM_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
    instagram: [
        { key: "access_token", label: "Access Token", placeholder: "EAABwzLixnjY..." },
        { key: "business_account_id", label: "Business Account ID", placeholder: "17841400000000000" },
        { key: "app_secret", label: "App Secret", placeholder: "abc123def456..." },
    ],
    facebook: [
        { key: "access_token", label: "Access Token", placeholder: "EAABwzLixnjY..." },
        { key: "page_id", label: "Page ID", placeholder: "100000000000000" },
        { key: "app_secret", label: "App Secret", placeholder: "def456ghi789..." },
    ],
    twitter: [
        { key: "api_key", label: "API Key", placeholder: "xAi1234567890..." },
        { key: "api_secret", label: "API Secret", placeholder: "xAs1234567890..." },
        { key: "access_token", label: "Access Token", placeholder: "1234567890-..." },
        { key: "access_token_secret", label: "Access Token Secret", placeholder: "ExampleAccess..." },
        { key: "bearer_token", label: "Bearer Token", placeholder: "AAAAAAAAAA..." },
    ],
    youtube: [
        { key: "api_key", label: "API Key", placeholder: "AIzaSy..." },
        { key: "client_id", label: "Client ID", placeholder: "123456789012-..." },
        { key: "client_secret", label: "Client Secret", placeholder: "GOCSPX-..." },
        { key: "refresh_token", label: "Refresh Token", placeholder: "1//0Example..." },
    ],
};

const PLATFORM_ICONS: Record<string, string> = {
    instagram: "📸", facebook: "👤", twitter: "🐦", youtube: "▶️",
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
    background: "var(--clawt-surface)",
    border: "1px solid var(--clawt-border)",
    borderRadius: "16px",
    padding: "24px",
    overflow: "hidden",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid var(--clawt-border)",
    background: "var(--clawt-bg)",
    color: "var(--clawt-text)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

const btnPrimary: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #dc2626, #991b1b)",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
};

const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    background: "var(--clawt-surface-2)",
    border: "1px solid var(--clawt-border)",
};

const btnDanger: React.CSSProperties = {
    ...btnPrimary,
    background: "transparent",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--clawt-text-dim)",
    marginBottom: "6px",
};

// ─── Toast ──────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div
            style={{
                position: "fixed",
                top: 24,
                right: 24,
                zIndex: 1000,
                padding: "14px 24px",
                borderRadius: "12px",
                background: type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                border: `1px solid ${type === "success" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                color: type === "success" ? "#22c55e" : "#ef4444",
                fontSize: "14px",
                fontWeight: 500,
                backdropFilter: "blur(10px)",
                animation: "fadeIn 0.3s ease",
            }}
        >
            {type === "success" ? "✅" : "❌"} {message}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("cron");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = useCallback((message: string, type: "success" | "error") => {
        setToast({ message, type });
    }, []);

    return (
        <div className="min-h-screen" style={{ background: "var(--clawt-bg)" }}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
                <p style={{ color: "var(--clawt-text-dim)" }}>
                    Configure your agents, connect platforms, and manage integrations
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "12px",
                            border: "1px solid",
                            borderColor: activeTab === tab.id ? "rgba(220, 38, 38, 0.5)" : "var(--clawt-border)",
                            background: activeTab === tab.id
                                ? "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05))"
                                : "var(--clawt-surface)",
                            color: activeTab === tab.id ? "white" : "var(--clawt-text-dim)",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.3s",
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "cron" && <CronTab onToast={showToast} />}
            {activeTab === "platforms" && <PlatformsTab onToast={showToast} />}
            {activeTab === "drive" && <DriveTab onToast={showToast} />}
            {activeTab === "aimodels" && <AIModelsTab onToast={showToast} />}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1: Cron Jobs
// ═══════════════════════════════════════════════════════════════════════════════

function CronTab({ onToast }: { onToast: (msg: string, t: "success" | "error") => void }) {
    const [settings, setSettings] = useState<CronSettings>({
        scheduler_hour: 9,
        scheduler_minute: 0,
        engagement_delay_hours: 2,
        analytics_day_of_week: 1,
        analytics_hour: 8,
        analytics_minute: 0,
        timezone: "Asia/Kolkata",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getCronSettings()
            .then(setSettings)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateCronSettings(settings);
            setSettings(updated);
            onToast("Cron schedules saved successfully", "success");
        } catch {
            onToast("Failed to save cron settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ color: "var(--clawt-text-dim)" }}>Loading settings...</div>;

    return (
        <div className="grid gap-6" style={{ maxWidth: 800 }}>
            {/* Scheduler Bot */}
            <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)" }}
                    >
                        📅
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Scheduler Bot</h3>
                        <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                            Runs daily to publish approved content
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label style={labelStyle}>Hour (0–23)</label>
                        <input
                            type="number"
                            min={0} max={23}
                            value={settings.scheduler_hour}
                            onChange={(e) => setSettings({ ...settings, scheduler_hour: +e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Minute (0–59)</label>
                        <input
                            type="number"
                            min={0} max={59}
                            value={settings.scheduler_minute}
                            onChange={(e) => setSettings({ ...settings, scheduler_minute: +e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                </div>
            </div>

            {/* Engagement Bot */}
            <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)" }}
                    >
                        💬
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Engagement Bot</h3>
                        <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                            Delay after publishing before monitoring comments
                        </p>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Delay (hours)</label>
                    <input
                        type="number"
                        min={1} max={48}
                        value={settings.engagement_delay_hours}
                        onChange={(e) => setSettings({ ...settings, engagement_delay_hours: +e.target.value })}
                        style={{ ...inputStyle, maxWidth: 200 }}
                    />
                </div>
            </div>

            {/* Analytics Agent */}
            <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)" }}
                    >
                        📊
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Analytics Agent</h3>
                        <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                            Weekly analytics report generation
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label style={labelStyle}>Day of Week</label>
                        <select
                            value={settings.analytics_day_of_week}
                            onChange={(e) => setSettings({ ...settings, analytics_day_of_week: +e.target.value })}
                            style={selectStyle}
                        >
                            {DAYS.map((d, i) => (
                                <option key={d} value={i}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Hour (0–23)</label>
                        <input
                            type="number"
                            min={0} max={23}
                            value={settings.analytics_hour}
                            onChange={(e) => setSettings({ ...settings, analytics_hour: +e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Minute (0–59)</label>
                        <input
                            type="number"
                            min={0} max={59}
                            value={settings.analytics_minute}
                            onChange={(e) => setSettings({ ...settings, analytics_minute: +e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                </div>
            </div>

            {/* Timezone */}
            <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "rgba(234, 179, 8, 0.15)", border: "1px solid rgba(234, 179, 8, 0.3)" }}
                    >
                        🌍
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Timezone</h3>
                        <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                            All schedules use this timezone
                        </p>
                    </div>
                </div>
                <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    style={{ ...selectStyle, maxWidth: 320 }}
                >
                    {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                    {saving ? "Saving..." : "💾 Save Schedules"}
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2: Platform Credentials
// ═══════════════════════════════════════════════════════════════════════════════

function PlatformsTab({ onToast }: { onToast: (msg: string, t: "success" | "error") => void }) {
    // Default platform list so cards always render even without backend
    const DEFAULT_PLATFORMS: PlatformCredential[] = Object.keys(PLATFORM_FIELDS).map((p) => ({
        platform: p,
        is_active: false,
        credential_keys: [],
        masked_credentials: {},
        last_tested_at: null,
        test_status: null,
    }));

    const [platforms, setPlatforms] = useState<PlatformCredential[]>(DEFAULT_PLATFORMS);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
    const [testing, setTesting] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadPlatforms = useCallback(async () => {
        try {
            const data = await listPlatformCredentials();
            if (data && data.length > 0) {
                setPlatforms(data);
            }
            // If API returns empty or fails, we keep DEFAULT_PLATFORMS
        } catch { /* keep defaults */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadPlatforms(); }, [loadPlatforms]);

    const handleSave = async (platform: string) => {
        const creds = formData[platform];
        if (!creds || Object.values(creds).every((v) => !v)) {
            onToast("Please fill in at least one credential field", "error");
            return;
        }
        setSaving(platform);
        try {
            await savePlatformCredential(platform, creds);
            await loadPlatforms();
            setFormData((prev) => ({ ...prev, [platform]: {} }));
            onToast(`${platform} credentials saved`, "success");
        } catch {
            onToast(`Failed to save ${platform} credentials`, "error");
        } finally {
            setSaving(null);
        }
    };

    const handleTest = async (platform: string) => {
        setTesting(platform);
        try {
            const res = await testPlatformCredential(platform) as { status: string; message: string };
            onToast(res.message, res.status === "connected" ? "success" : "error");
            await loadPlatforms();
        } catch {
            onToast(`Test failed for ${platform}`, "error");
        } finally {
            setTesting(null);
        }
    };

    const handleDelete = async (platform: string) => {
        try {
            await deletePlatformCredential(platform);
            await loadPlatforms();
            onToast(`${platform} credentials removed`, "success");
        } catch {
            onToast(`Failed to remove ${platform} credentials`, "error");
        }
    };

    if (loading) return <div style={{ color: "var(--clawt-text-dim)" }}>Loading platforms...</div>;

    return (
        <div className="grid gap-4" style={{ maxWidth: 800 }}>
            {platforms.map((plat) => {
                const isExpanded = expanded === plat.platform;
                const fields = PLATFORM_FIELDS[plat.platform] || [];
                const icon = PLATFORM_ICONS[plat.platform] || "🔗";
                const form = formData[plat.platform] || {};

                const statusColor = plat.test_status === "connected"
                    ? "#22c55e"
                    : plat.test_status === "failed"
                        ? "#ef4444"
                        : "var(--clawt-text-dim)";

                return (
                    <div key={plat.platform} style={cardStyle}>
                        {/* Header */}
                        <button
                            onClick={() => setExpanded(isExpanded ? null : plat.platform)}
                            className="w-full flex items-center justify-between"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "white" }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{icon}</span>
                                <div className="text-left">
                                    <h3 className="font-semibold capitalize">{plat.platform}</h3>
                                    <p className="text-xs" style={{ color: statusColor }}>
                                        {plat.credential_keys.length > 0
                                            ? `${plat.credential_keys.length} keys configured`
                                            : "Not configured"}
                                        {plat.test_status && ` • ${plat.test_status}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {plat.is_active && plat.credential_keys.length > 0 && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            background: "rgba(34, 197, 94, 0.15)",
                                            color: "#22c55e",
                                            border: "1px solid rgba(34, 197, 94, 0.3)",
                                        }}
                                    >
                                        Active
                                    </span>
                                )}
                                <span style={{ fontSize: "18px", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                                    ▾
                                </span>
                            </div>
                        </button>

                        {/* Expanded */}
                        {isExpanded && (
                            <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--clawt-border)" }}>
                                {/* Current values (masked) */}
                                {plat.credential_keys.length > 0 && (
                                    <div className="mb-5 p-4 rounded-xl" style={{ background: "var(--clawt-bg)" }}>
                                        <p className="text-xs font-medium mb-3" style={{ color: "var(--clawt-text-dim)" }}>
                                            Current credentials (masked)
                                        </p>
                                        {Object.entries(plat.masked_credentials).map(([key, val]) => (
                                            <div key={key} className="flex justify-between items-center mb-1" style={{ overflow: "hidden" }}>
                                                <span className="text-xs flex-shrink-0" style={{ color: "var(--clawt-text-dim)" }}>{key}</span>
                                                <code className="text-xs" style={{
                                                    color: "var(--clawt-text-dim)",
                                                    fontFamily: "monospace",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    maxWidth: "60%",
                                                    marginLeft: "8px",
                                                }}>
                                                    {val}
                                                </code>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Input fields */}
                                <div className="grid gap-3 mb-5">
                                    {fields.map((field) => (
                                        <div key={field.key}>
                                            <label style={labelStyle}>{field.label}</label>
                                            <input
                                                type="password"
                                                placeholder={field.placeholder}
                                                value={form[field.key] || ""}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [plat.platform]: { ...(prev[plat.platform] || {}), [field.key]: e.target.value },
                                                    }))
                                                }
                                                style={inputStyle}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        onClick={() => handleSave(plat.platform)}
                                        disabled={saving === plat.platform}
                                        style={btnPrimary}
                                    >
                                        {saving === plat.platform ? "Saving..." : "💾 Save Keys"}
                                    </button>
                                    {plat.credential_keys.length > 0 && (
                                        <>
                                            <button
                                                onClick={() => handleTest(plat.platform)}
                                                disabled={testing === plat.platform}
                                                style={btnSecondary}
                                            >
                                                {testing === plat.platform ? "Testing..." : "🔌 Test Connection"}
                                            </button>
                                            <button onClick={() => handleDelete(plat.platform)} style={btnDanger}>
                                                🗑️ Remove
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 3: Google Drive
// ═══════════════════════════════════════════════════════════════════════════════

function DriveTab({ onToast }: { onToast: (msg: string, t: "success" | "error") => void }) {
    const [config, setConfig] = useState<GoogleDriveConfig>({
        folder_url: null,
        folder_id: null,
        is_connected: false,
        last_synced_at: null,
    });
    const [folderUrl, setFolderUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getGoogleDriveConfig()
            .then((data) => {
                setConfig(data);
                if (data.folder_url) setFolderUrl(data.folder_url);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleConnect = async () => {
        if (!folderUrl.trim()) {
            onToast("Please enter a Google Drive folder URL", "error");
            return;
        }
        setSaving(true);
        try {
            const updated = await updateGoogleDriveConfig({ folder_url: folderUrl });
            setConfig(updated);
            onToast("Google Drive folder connected", "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to connect Google Drive";
            onToast(message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectGoogleDrive();
            setConfig({ folder_url: null, folder_id: null, is_connected: false, last_synced_at: null });
            setFolderUrl("");
            onToast("Google Drive disconnected", "success");
        } catch {
            onToast("Failed to disconnect Google Drive", "error");
        }
    };

    if (loading) return <div style={{ color: "var(--clawt-text-dim)" }}>Loading Drive config...</div>;

    return (
        <div style={{ maxWidth: 800 }}>
            <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)" }}
                    >
                        📁
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Google Drive Integration</h3>
                        <p className="text-sm" style={{ color: "var(--clawt-text-dim)" }}>
                            Connect a Drive folder to fetch content assets (images, videos, documents)
                        </p>
                    </div>
                </div>

                {/* Status */}
                {config.is_connected && (
                    <div
                        className="mb-6 p-4 rounded-xl flex items-center justify-between"
                        style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <div>
                                <p className="text-sm font-medium text-white">Connected</p>
                                <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                                    Folder ID: <code className="text-xs">{config.folder_id}</code>
                                </p>
                            </div>
                        </div>
                        {config.last_synced_at && (
                            <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                                Last synced: {new Date(config.last_synced_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {/* URL Input */}
                <div className="mb-6">
                    <label style={labelStyle}>Google Drive Folder URL</label>
                    <input
                        type="url"
                        value={folderUrl}
                        onChange={(e) => setFolderUrl(e.target.value)}
                        placeholder="https://drive.google.com/drive/folders/1ABC..."
                        style={inputStyle}
                    />
                    <p className="mt-2 text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                        Open your Google Drive folder → copy the URL from the address bar
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={handleConnect} disabled={saving} style={btnPrimary}>
                        {saving ? "Connecting..." : config.is_connected ? "🔄 Update Folder" : "🔗 Connect Folder"}
                    </button>
                    {config.is_connected && (
                        <button onClick={handleDisconnect} style={btnDanger}>
                            ❌ Disconnect
                        </button>
                    )}
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-6" style={{ ...cardStyle, background: "rgba(59, 130, 246, 0.05)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                <h4 className="font-semibold text-white mb-3">💡 How to use Google Drive</h4>
                <ol className="text-sm grid gap-2" style={{ color: "var(--clawt-text-dim)", paddingLeft: 20, listStyle: "decimal" }}>
                    <li>Create a folder in Google Drive for your media assets</li>
                    <li>Upload images, videos, or documents you want to use in your posts</li>
                    <li>Copy the folder URL and paste it above</li>
                    <li>ClawtBot will access files from this folder when generating content</li>
                </ol>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 4: AI Models
// ═══════════════════════════════════════════════════════════════════════════════

const PROVIDER_META: Record<string, { icon: string; label: string; color: string; description: string }> = {
    ollama: { icon: "🦙", label: "Ollama", color: "rgba(168, 85, 247, 0.3)", description: "Free, local inference" },
    openai: { icon: "🤖", label: "OpenAI", color: "rgba(16, 163, 127, 0.3)", description: "GPT-4o, GPT-4o-mini" },
    gemini: { icon: "💎", label: "Google Gemini", color: "rgba(59, 130, 246, 0.3)", description: "Gemini 2.0 Flash, 2.5 Pro" },
    anthropic: { icon: "🧠", label: "Anthropic", color: "rgba(234, 179, 8, 0.3)", description: "Claude Sonnet, Opus" },
    groq: { icon: "⚡", label: "Groq", color: "rgba(239, 68, 68, 0.3)", description: "Ultra-fast inference" },
};

const AGENT_META: Record<string, { icon: string; label: string; description: string }> = {
    content_creator: { icon: "📝", label: "Content Creator", description: "Generates post text, captions, CTAs" },
    hashtag_generator: { icon: "#️⃣", label: "Hashtag Generator", description: "Generates niche & broad hashtags" },
    review_agent: { icon: "🔍", label: "Review Agent", description: "Scores content quality & compliance" },
    engagement_bot: { icon: "💬", label: "Engagement Bot", description: "Generates replies to comments" },
    analytics_agent: { icon: "📊", label: "Analytics Agent", description: "Generates weekly summary reports" },
};

// Default provider models for client-side fallback
const DEFAULT_PROVIDER_MODELS: Record<string, string[]> = {
    ollama: ["llama3", "llama3.1", "llama3.2", "mistral", "gemma2", "phi3", "codellama", "deepseek-r1"],
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini"],
    gemini: ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro"],
    anthropic: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-3-20240307"],
    groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
};

function AIModelsTab({ onToast }: { onToast: (msg: string, t: "success" | "error") => void }) {
    const DEFAULT_PROVIDERS: LLMProvider[] = Object.keys(PROVIDER_META).map((p) => ({
        provider: p,
        models: DEFAULT_PROVIDER_MODELS[p] || [],
        is_configured: p === "ollama",
        is_enabled: p === "ollama",
        test_status: null,
        last_tested_at: null,
        masked_key: null,
    }));

    const DEFAULT_AGENTS: AgentModelConfig[] = Object.keys(AGENT_META).map((a) => ({
        agent_id: a,
        provider: "ollama",
        model: "llama3",
        is_custom: false,
    }));

    const [providers, setProviders] = useState<LLMProvider[]>(DEFAULT_PROVIDERS);
    const [agents, setAgents] = useState<AgentModelConfig[]>(DEFAULT_AGENTS);
    const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [testingProvider, setTestingProvider] = useState<string | null>(null);
    const [savingAgent, setSavingAgent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [provData, agentData] = await Promise.all([
                listLLMProviders().catch(() => null),
                listAgentModelConfigs().catch(() => null),
            ]);
            if (provData && provData.length > 0) setProviders(provData);
            if (agentData && agentData.length > 0) setAgents(agentData);
        } catch { /* keep defaults */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSaveKey = async (provider: string) => {
        const key = keyInputs[provider];
        if (!key?.trim()) {
            onToast("Please enter an API key", "error");
            return;
        }
        setSavingKey(provider);
        try {
            await saveLLMProviderKey(provider, key);
            setKeyInputs((prev) => ({ ...prev, [provider]: "" }));
            await loadData();
            onToast(`${PROVIDER_META[provider]?.label} API key saved`, "success");
        } catch {
            onToast(`Failed to save ${provider} key`, "error");
        } finally {
            setSavingKey(null);
        }
    };

    const handleDeleteKey = async (provider: string) => {
        try {
            await deleteLLMProviderKey(provider);
            await loadData();
            onToast(`${PROVIDER_META[provider]?.label} key removed`, "success");
        } catch {
            onToast(`Failed to remove ${provider} key`, "error");
        }
    };

    const handleTestProvider = async (provider: string) => {
        setTestingProvider(provider);
        try {
            const res = await testLLMProvider(provider) as { status: string; message: string };
            onToast(res.message, res.status === "connected" ? "success" : "error");
            await loadData();
        } catch {
            onToast(`Test failed for ${provider}`, "error");
        } finally {
            setTestingProvider(null);
        }
    };

    const handleAssignAgent = async (agentId: string, provider: string, model: string) => {
        setSavingAgent(agentId);
        try {
            await assignAgentModel(agentId, provider, model);
            await loadData();
            onToast(`${AGENT_META[agentId]?.label} → ${PROVIDER_META[provider]?.label} / ${model}`, "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to assign model";
            onToast(message, "error");
        } finally {
            setSavingAgent(null);
        }
    };

    const handleResetAgent = async (agentId: string) => {
        try {
            await resetAgentModel(agentId);
            await loadData();
            onToast(`${AGENT_META[agentId]?.label} reset to default (Ollama)`, "success");
        } catch {
            onToast("Failed to reset agent", "error");
        }
    };

    // Get available models for a provider from our loaded data
    const getModels = (providerName: string): string[] => {
        const p = providers.find((pr) => pr.provider === providerName);
        return p?.models || DEFAULT_PROVIDER_MODELS[providerName] || [];
    };

    // Get configured (keyed) providers only
    const configuredProviders = providers.filter((p) => p.is_configured);

    if (loading) return <div style={{ color: "var(--clawt-text-dim)" }}>Loading AI configuration...</div>;

    return (
        <div className="grid gap-8" style={{ maxWidth: 900 }}>
            {/* ── Section 1: Provider API Keys ──────────────────── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)" }}
                    >
                        🔑
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Provider API Keys</h3>
                        <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                            Configure API keys for each LLM provider. Ollama is free and runs locally.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {providers.map((prov) => {
                        const meta = PROVIDER_META[prov.provider] || { icon: "🔗", label: prov.provider, color: "var(--clawt-border)", description: "" };
                        const isOllama = prov.provider === "ollama";

                        const statusColor = prov.test_status === "connected"
                            ? "#22c55e"
                            : prov.test_status === "failed"
                                ? "#ef4444"
                                : "var(--clawt-text-dim)";

                        return (
                            <div key={prov.provider} style={cardStyle}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                            style={{ background: meta.color.replace("0.3", "0.15"), border: `1px solid ${meta.color}` }}
                                        >
                                            {meta.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{meta.label}</h4>
                                            <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                                                {meta.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {prov.is_configured && (
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: "rgba(34, 197, 94, 0.15)",
                                                    color: "#22c55e",
                                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                                }}
                                            >
                                                {isOllama ? "Local" : "Configured"}
                                            </span>
                                        )}
                                        {prov.test_status && (
                                            <span className="text-xs" style={{ color: statusColor }}>
                                                • {prov.test_status}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!isOllama && (
                                    <div>
                                        {/* Show masked key if configured */}
                                        {prov.masked_key && (
                                            <p className="text-xs mb-3 font-mono" style={{ color: "var(--clawt-text-dim)" }}>
                                                Current key: {prov.masked_key}
                                            </p>
                                        )}
                                        <div className="flex gap-3">
                                            <input
                                                type="password"
                                                placeholder={`Enter ${meta.label} API key...`}
                                                value={keyInputs[prov.provider] || ""}
                                                onChange={(e) =>
                                                    setKeyInputs((prev) => ({ ...prev, [prov.provider]: e.target.value }))
                                                }
                                                style={{ ...inputStyle, flex: 1 }}
                                            />
                                            <button
                                                onClick={() => handleSaveKey(prov.provider)}
                                                disabled={savingKey === prov.provider}
                                                style={btnPrimary}
                                            >
                                                {savingKey === prov.provider ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                        {prov.is_configured && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleTestProvider(prov.provider)}
                                                    disabled={testingProvider === prov.provider}
                                                    style={{ ...btnSecondary, padding: "6px 16px", fontSize: "13px" }}
                                                >
                                                    {testingProvider === prov.provider ? "Testing..." : "🔌 Test"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKey(prov.provider)}
                                                    style={{ ...btnDanger, padding: "6px 16px", fontSize: "13px" }}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isOllama && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleTestProvider("ollama")}
                                            disabled={testingProvider === "ollama"}
                                            style={{ ...btnSecondary, padding: "6px 16px", fontSize: "13px" }}
                                        >
                                            {testingProvider === "ollama" ? "Testing..." : "🔌 Test Connection"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Section 2: Agent Model Assignments ──────────────────── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)" }}
                    >
                        🎯
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Agent Model Assignments</h3>
                        <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                            Assign a specific LLM to each agent. Defaults to Ollama if not overridden.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {agents.map((agent) => {
                        const meta = AGENT_META[agent.agent_id] || { icon: "🤖", label: agent.agent_id, description: "" };

                        return (
                            <div key={agent.agent_id} style={cardStyle}>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    {/* Agent info */}
                                    <div className="flex items-center gap-3 min-w-48">
                                        <span className="text-2xl">{meta.icon}</span>
                                        <div>
                                            <h4 className="font-semibold text-white">{meta.label}</h4>
                                            <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                                                {meta.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Selection dropdowns */}
                                    <div className="flex items-center gap-3 flex-wrap flex-1 justify-end">
                                        <div>
                                            <label className="text-xs block mb-1" style={{ color: "var(--clawt-text-dim)" }}>Provider</label>
                                            <select
                                                value={agent.provider}
                                                onChange={(e) => {
                                                    const newProvider = e.target.value;
                                                    const models = getModels(newProvider);
                                                    handleAssignAgent(agent.agent_id, newProvider, models[0] || "");
                                                }}
                                                disabled={savingAgent === agent.agent_id}
                                                style={{ ...selectStyle, minWidth: 140 }}
                                            >
                                                {configuredProviders.map((cp) => (
                                                    <option key={cp.provider} value={cp.provider}>
                                                        {PROVIDER_META[cp.provider]?.label || cp.provider}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs block mb-1" style={{ color: "var(--clawt-text-dim)" }}>Model</label>
                                            <select
                                                value={agent.model}
                                                onChange={(e) => handleAssignAgent(agent.agent_id, agent.provider, e.target.value)}
                                                disabled={savingAgent === agent.agent_id}
                                                style={{ ...selectStyle, minWidth: 200 }}
                                            >
                                                {getModels(agent.provider).map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {agent.is_custom && (
                                            <button
                                                onClick={() => handleResetAgent(agent.agent_id)}
                                                style={{
                                                    ...btnDanger,
                                                    padding: "6px 12px",
                                                    fontSize: "12px",
                                                    marginTop: "18px",
                                                }}
                                                title="Reset to default (Ollama)"
                                            >
                                                ↩️ Reset
                                            </button>
                                        )}

                                        {!agent.is_custom && (
                                            <span
                                                className="px-2 py-1 rounded-full text-xs"
                                                style={{
                                                    background: "rgba(168, 85, 247, 0.1)",
                                                    color: "rgba(168, 85, 247, 0.8)",
                                                    border: "1px solid rgba(168, 85, 247, 0.2)",
                                                    marginTop: "18px",
                                                }}
                                            >
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Help section */}
            <div style={{ ...cardStyle, background: "rgba(168, 85, 247, 0.05)", borderColor: "rgba(168, 85, 247, 0.2)" }}>
                <h4 className="font-semibold text-white mb-3">💡 How AI Models work</h4>
                <ol className="text-sm grid gap-2" style={{ color: "var(--clawt-text-dim)", paddingLeft: 20, listStyle: "decimal" }}>
                    <li><strong>Default:</strong> All agents use Ollama (free, runs locally on your machine)</li>
                    <li><strong>Add a provider key</strong> above to unlock cloud LLMs (OpenAI, Gemini, etc.)</li>
                    <li><strong>Assign per agent:</strong> Pick which provider + model each agent should use</li>
                    <li><strong>Usage & billing:</strong> Cloud providers use your API key&apos;s plan/quota — check their dashboards</li>
                    <li><strong>Reset anytime:</strong> Click &quot;Reset&quot; to switch any agent back to Ollama</li>
                </ol>
            </div>
        </div>
    );
}
