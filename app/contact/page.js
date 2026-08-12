"use client";
import React, { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "64px 24px", margin: "0 auto" }}>
      <div style={{
        background: "rgba(18, 26, 21, 0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "40px",
        boxShadow: "var(--shadow-card)"
      }}>
        <h1 style={{ color: "var(--color-accent)", fontSize: "2.5rem", marginBottom: "24px", fontFamily: "var(--font-heading)" }}>
          Contact Us
        </h1>
        <p style={{ marginBottom: "20px", lineHeight: "1.8" }}>
          Are you a mod developer who wants their work featured or needs a detail update? Or a player with suggestions for improving Creevoxx MC Mods? Drop us a line using the form below or email us directly at <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>.
        </p>

        {submitted ? (
          <div style={{ padding: "24px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--color-accent)", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "8px" }}>Message Sent Successfully!</h3>
            <p>Thank you for reaching out. We will get back to you shortly.</p>
            <button onClick={() => setSubmitted(false)} style={{ marginTop: "16px", padding: "8px 16px", background: "var(--color-surface)", color: "var(--color-text)", border: "1px solid var(--color-border)", borderRadius: "4px", cursor: "pointer" }}>Send another message</button>
          </div>
        ) : (
          <form style={{ display: "flex", flexDirection: "column", gap: "16px" }} onSubmit={handleSubmit}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>Name</label>
              <input 
                type="text" 
                placeholder="Steve"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontFamily: "inherit"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>Email Address</label>
              <input 
                type="email" 
                placeholder="steve@minecraft.net"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontFamily: "inherit"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>Message</label>
              <textarea 
                rows="5"
                placeholder="How can we help you?"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            </div>
            <button 
              type="submit"
              style={{
                background: "var(--color-accent)",
                color: "#000",
                fontWeight: "bold",
                padding: "14px 24px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                fontSize: "1rem",
                marginTop: "8px",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
