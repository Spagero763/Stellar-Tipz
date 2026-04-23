import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import ToastContainer from "@/components/shared/ToastContainer";
import KeyboardShortcutsProvider from "@/components/shared/KeyboardShortcutsProvider";
import { routes } from "@/routes";

const AppRoutes: React.FC = () => {
  const routeElements = useRoutes(routes);

  return (
    <>
      <ScrollToTop />
      <KeyboardShortcutsProvider />
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-white dark:bg-black">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:font-black focus:outline-none"
          >
            Skip to main content
          </a>
          <Header />
          <div className="flex-1">{routeElements}</div>
          <Footer />
        </div>
      </ErrorBoundary>
      <ToastContainer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
