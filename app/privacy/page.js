import React from "react";

export const metadata = {
  title: "Privacy Policy | Creevoxx MC Mods",
  description:
    "Read our privacy policy to understand how Creevoxx MC Mods manages third-party advertising, cookies, user data choices, GDPR rights, and CCPA rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ maxWidth: "800px", padding: "64px 24px", margin: "0 auto" }}>
      <div
        style={{
          background: "rgba(18, 26, 21, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <h1
          style={{
            color: "var(--color-accent)",
            fontSize: "2.5rem",
            marginBottom: "24px",
            fontFamily: "var(--font-heading)",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
          Last Updated: July 12, 2026
        </p>

        {/* Introduction */}
        <section style={{ marginBottom: "32px" }}>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Welcome to Creevoxx MC Mods (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We are committed to protecting your privacy
            while you explore Minecraft shaders, textures, and mods. This policy explains what information we collect,
            how it is used, and the control you have over your data. If you have questions, contact us at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>.
          </p>
        </section>

        {/* Advertising Disclosure */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Advertising Disclosure
          </h2>
          <p style={{ marginBottom: "12px", lineHeight: "1.8" }}>
            <strong>This site displays advertisements provided by Google AdSense.</strong> Google AdSense is a
            third-party ad network operated by Google LLC. When you visit pages on this site, Google may serve ads
            based on your prior visits to this and other websites across the internet. This is called interest-based
            or personalized advertising.
          </p>
          <p style={{ marginBottom: "12px", lineHeight: "1.8" }}>
            We have no control over which specific ads Google displays, how they are targeted, or their content
            beyond the category-level exclusions we set in our AdSense account. We receive revenue when visitors
            interact with ads, which funds the operation of this site.
          </p>
          <p style={{ marginBottom: "12px", lineHeight: "1.8" }}>
            <strong>How to control ad personalization:</strong> You can opt out of Google&apos;s personalized advertising
            at any time by visiting{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)", textDecoration: "underline" }}
            >
              Google Ads Settings
            </a>
            . After opting out, you will still see ads on this site, but they will not be personalized based on your
            browsing history.
          </p>
        </section>

        {/* Google AdSense & Third-Party Advertising */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Google AdSense & Third-Party Advertising
          </h2>
          <p style={{ marginBottom: "12px", lineHeight: "1.8" }}>
            Creevoxx MC Mods uses Google AdSense to serve advertisements. Google, as a third-party vendor, uses cookies
            to serve ads on our site.
          </p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "24px",
              marginBottom: "12px",
              color: "var(--color-text-muted)",
              lineHeight: "1.8",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our
              site and/or other sites on the internet.
            </li>
            <li style={{ marginBottom: "8px" }}>
              You may opt out of personalized advertising by visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-accent)", textDecoration: "underline" }}
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li style={{ marginBottom: "8px" }}>
              You can also opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{" "}
              <a
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-accent)", textDecoration: "underline" }}
              >
                About Ads
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Cookies & Trackers */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Cookies & Trackers
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            We use cookies and similar tracking technologies to analyze web traffic, optimize site performance, and
            deliver personalized advertisements. Cookies are small text files stored on your device by your browser.
            The cookies used on this site fall into the following categories:
          </p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "24px",
              marginBottom: "12px",
              color: "var(--color-text-muted)",
              lineHeight: "1.8",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Essential cookies:</strong> Required for the site to
              function (e.g., storing your cookie consent preference).
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Advertising cookies:</strong> Set by Google AdSense to
              enable interest-based advertising.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Analytics cookies:</strong> Help us understand how
              visitors use the site so we can improve it.
            </li>
          </ul>
          <p style={{ lineHeight: "1.8" }}>
            You can configure your browser to refuse all cookies or to alert you when a cookie is being set. Please
            note that if you disable cookies, some features of our site (such as bookmarks stored locally) may not
            function correctly.
          </p>
        </section>

        {/* Log Files & Analytics */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Log Files & Analytics
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Like most websites, we collect standard server log data when you visit. This includes IP addresses,
            browser types, operating systems, referring pages, exit pages, and page interaction data. This information
            is analyzed in aggregate — we look at patterns across all visitors, not individual sessions — to improve
            site design and performance. We do not sell this data to third parties.
          </p>
        </section>

        {/* Children's Privacy */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Children&apos;s Privacy (COPPA)
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            This site is not directed to children under the age of 13. We do not knowingly collect personal
            information from children under 13. Minecraft&apos;s audience includes younger players, and we have configured
            our AdSense account to serve only non-personalized ads where required by law (including for visitors in
            the European Economic Area and the United Kingdom). If you believe a child under 13 has submitted
            personal information to us (e.g., via our contact form), please contact us immediately at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span> and we will remove the
            information promptly.
          </p>
        </section>

        {/* GDPR Rights */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Your Rights Under GDPR (EEA & UK Visitors)
          </h2>
          <p style={{ marginBottom: "12px", lineHeight: "1.8" }}>
            If you are located in the European Economic Area (EEA) or the United Kingdom, you have the following
            rights under the General Data Protection Regulation (GDPR) and UK GDPR:
          </p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "24px",
              marginBottom: "12px",
              color: "var(--color-text-muted)",
              lineHeight: "1.8",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Right to access:</strong> Request a copy of the personal
              data we hold about you.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Right to rectification:</strong> Request correction of
              inaccurate personal data.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Right to erasure:</strong> Request deletion of your
              personal data where there is no legitimate reason for us to continue processing it.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Right to object:</strong> Object to processing of your
              personal data for direct marketing purposes.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "var(--color-text)" }}>Right to withdraw consent:</strong> Withdraw your consent
              to cookie/advertising tracking at any time via your browser settings or Google Ads Settings.
            </li>
          </ul>
          <p style={{ lineHeight: "1.8" }}>
            To exercise any of these rights, contact us at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>. We will respond within 30
            days of receiving your request.
          </p>
        </section>

        {/* California CCPA */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            California Privacy Rights (CCPA)
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            If you are a California resident, the California Consumer Privacy Act (CCPA) gives you specific rights
            regarding your personal information. We do not sell your personal information. You have the right to
            know what categories of personal information we collect, to request deletion of your personal
            information, and to non-discrimination for exercising your CCPA rights. To submit a CCPA request,
            contact us at <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>.
          </p>
        </section>

        {/* Data Retention */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Data Retention
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            We retain server log data for up to 90 days for security and analytics purposes, after which it is
            deleted. Contact form messages are retained for as long as necessary to resolve your inquiry. Cookie
            consent preferences stored in your browser remain until you clear your browser data or explicitly
            withdraw consent. We do not retain personal information longer than necessary for the purposes described
            in this policy.
          </p>
        </section>

        {/* Contact */}
        <section style={{ marginBottom: "0" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Contact Us
          </h2>
          <p style={{ lineHeight: "1.8" }}>
            If you have questions about this privacy policy, our tracking practices, or wish to exercise any of your
            data rights, please contact us at:{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>. We aim to respond within 2
            business days for general inquiries and within 30 days for formal data rights requests.
          </p>
        </section>
      </div>
    </div>
  );
}
