import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

const GLOBAL_FAVICON_URL = "/favicon.svg?v=global-favicon";
const ICON_RELS = ["icon", "shortcut icon", "apple-touch-icon"] as const;

const enforceGlobalFavicon = () => {
  const resolvedFaviconUrl = new URL(GLOBAL_FAVICON_URL, window.location.origin).href;

  ICON_RELS.forEach((rel) => {
    const links = document.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`);

    links.forEach((link, index) => {
      if (index === 0) {
        if (link.href !== resolvedFaviconUrl) {
          link.href = GLOBAL_FAVICON_URL;
        }
        return;
      }
      link.remove();
    });

    if (links.length === 0) {
      const link = document.createElement("link");
      link.setAttribute("rel", rel);
      if (rel === "icon") {
        link.setAttribute("type", "image/svg+xml");
      }
      if (rel === "apple-touch-icon") {
        link.setAttribute("sizes", "180x180");
      }
      link.href = GLOBAL_FAVICON_URL;
      document.head.appendChild(link);
    }
  });
};

enforceGlobalFavicon();

const headObserver = new MutationObserver(() => {
  enforceGlobalFavicon();
});

headObserver.observe(document.head, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href", "rel"],
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
