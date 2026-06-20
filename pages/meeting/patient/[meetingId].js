import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MeetingRoom from "../../../src/components/MeetingRoom/MeetingRoom";
import { api } from "../../../src/constant";

export default function PatientMeetingPage() {
  const router = useRouter();
  const pathSegments = window.location.pathname.split("/");
  const meetingId = pathSegments[pathSegments.length - 1];
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!meetingId) return;

    const fetchConsultation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${api.consultationByMeetingId}/${meetingId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch consultation: ${response.status}`);
        }
        const data = await response.json();
        setConsultation(data);
      } catch (err) {
        console.error("Error fetching consultation:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [meetingId]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.1)",
            borderTopColor: "#4facfe",
            animation: "spin 1s linear infinite",
            marginBottom: 24,
          }}
        />
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Loading consultation details...
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          Please wait while we fetch your appointment
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#1a1a2e",
          color: "#ffffff",
          textAlign: "center",
          padding: 40,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 8,
            color: "#ff6b6b",
          }}
        >
          Failed to Load Consultation
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 24,
            maxWidth: 400,
          }}
        >
          {error}
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 24px",
            background: "#4facfe",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <MeetingRoom
      consultation={consultation}
      userType="patient"
      meetingId={meetingId}
    />
  );
}
