import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  { rel: "icon", type: "image/png", href: "/images/logov2.png" },
];

export const meta: MetaFunction = () => [
  {
    name: "keywords",
    content:
      "UCI CubeSat, UC Irvine, nanosatellite, space, aerospace engineering, student organization, thermal control, satellite",
  },
  { name: "author", content: "UCI CubeSat Team" },
  { property: "og:type", content: "website" },
  {
    property: "og:image",
    content: "https://ucicubesat.com/images/og-image.png",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UCI CubeSat",
  url: "https://ucicubesat.com",
  logo: "https://ucicubesat.com/images/logov2.png",
  description:
    "A student-led organization at UC Irvine dedicated to designing, building, and launching a 2U nanosatellite into Low Earth Orbit.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Irvine",
    addressRegion: "CA",
  },
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#070A0F" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h1 className="font-bold text-[72px] text-primary mb-4 max-sm:text-[48px]">
          {error.status}
        </h1>
        <p className="text-lg text-muted mb-8">
          {error.status === 404 ? "Page Not Found" : error.statusText}
        </p>
        <Link
          to="/"
          className="text-sm font-medium text-earth transition-colors hover:text-atmosphere"
        >
          Back to Home →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="font-bold text-[72px] text-primary mb-4 max-sm:text-[48px]">
        Error
      </h1>
      <p className="text-lg text-muted mb-8">Something went wrong</p>
      <Link
        to="/"
        className="text-sm font-medium text-earth transition-colors hover:text-atmosphere"
      >
        Back to Home →
      </Link>
    </div>
  );
}
