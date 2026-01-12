import React from 'react';

interface HomeScreenProps {
  onGetStarted: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full">
        <div className="mx-auto mb-6 size-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3 3h18v2H3V3zm2 6h14v10H5V9zm3 2v6h2v-6H8zm4 0v6h2v-6h-2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Investment Comparator
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Compare real estate and stock market outcomes with local estimates.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-8 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
