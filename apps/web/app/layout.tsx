import type { Metadata } from "next";
import "./globals.css";
import { UiI18nProvider } from "@/components/UiI18nProvider";
import { getUiMessages } from "@/lib/ui-messages.server";

export const metadata: Metadata = {
  title: "CultureCall - Real-Time Cultural Intelligence",
  description:
    "AI-powered cultural insights for high-stakes conversations across languages",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialPayload = await getUiMessages("en");

  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <UiI18nProvider initialPayload={initialPayload}>{children}</UiI18nProvider>
      </body>
    </html>
  );
}
