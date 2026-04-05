import { Suspense, lazy } from "react";
import type { ComponentType } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "./components/encyclopedia/LoadingSpinner";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { AppShell } from "./components/encyclopedia/AppShell";
import { EncyclopediaDataProvider, useEncyclopediaData } from "./hooks/useEncyclopediaData";

function lazyPage<TModule extends Record<string, ComponentType<any>>>(
  loader: () => Promise<TModule>,
  exportName: keyof TModule,
) {
  return lazy(async () => ({ default: (await loader())[exportName] as ComponentType<any> }));
}

const HomePage = lazyPage(() => import("./pages/encyclopedia/HomePage"), "HomePage");
const SearchPage = lazyPage(() => import("./pages/encyclopedia/SearchPage"), "SearchPage");
const ComparePage = lazyPage(() => import("./pages/encyclopedia/ComparePage"), "ComparePage");
const NationalDexPage = lazyPage(() => import("./pages/encyclopedia/NationalDexPage"), "NationalDexPage");
const TrainerIndexPage = lazyPage(() => import("./pages/encyclopedia/TrainerIndexPage"), "TrainerIndexPage");
const TrainerAppearanceIndexPage = lazyPage(() => import("./pages/encyclopedia/TrainerAppearanceIndexPage"), "TrainerAppearanceIndexPage");
const TrainerDetailPage = lazyPage(() => import("./pages/encyclopedia/TrainerDetailPage"), "TrainerDetailPage");
const TrainerAppearancePage = lazyPage(() => import("./pages/encyclopedia/TrainerAppearancePage"), "TrainerAppearancePage");
const PokemonDetailPage = lazyPage(() => import("./pages/encyclopedia/PokemonDetailPage"), "PokemonDetailPage");
const PokemonMovesPage = lazyPage(() => import("./pages/encyclopedia/PokemonMovesPage"), "PokemonMovesPage");
const PokemonFormPage = lazyPage(() => import("./pages/encyclopedia/PokemonFormPage"), "PokemonFormPage");
const MoveIndexPage = lazyPage(() => import("./pages/encyclopedia/MoveIndexPage"), "MoveIndexPage");
const MoveDetailPage = lazyPage(() => import("./pages/encyclopedia/MoveDetailPage"), "MoveDetailPage");
const AbilityIndexPage = lazyPage(() => import("./pages/encyclopedia/AbilityIndexPage"), "AbilityIndexPage");
const AbilityDetailPage = lazyPage(() => import("./pages/encyclopedia/AbilityDetailPage"), "AbilityDetailPage");
const ItemIndexPage = lazyPage(() => import("./pages/encyclopedia/ItemIndexPage"), "ItemIndexPage");
const ItemDetailPage = lazyPage(() => import("./pages/encyclopedia/ItemDetailPage"), "ItemDetailPage");
const TypeIndexPage = lazyPage(() => import("./pages/encyclopedia/TypeIndexPage"), "TypeIndexPage");
const TypeDetailPage = lazyPage(() => import("./pages/encyclopedia/TypeDetailPage"), "TypeDetailPage");
const RegionIndexPage = lazyPage(() => import("./pages/encyclopedia/RegionIndexPage"), "RegionIndexPage");
const RegionPage = lazyPage(() => import("./pages/encyclopedia/RegionPage"), "RegionPage");
const GameIndexPage = lazyPage(() => import("./pages/encyclopedia/GameIndexPage"), "GameIndexPage");
const GameVersionPage = lazyPage(() => import("./pages/encyclopedia/GameVersionPage"), "GameVersionPage");
const GamePokemonIndexPage = lazyPage(() => import("./pages/encyclopedia/GamePokemonIndexPage"), "GamePokemonIndexPage");
const GameTrainerIndexPage = lazyPage(() => import("./pages/encyclopedia/GameTrainerIndexPage"), "GameTrainerIndexPage");
const GameLocationIndexPage = lazyPage(() => import("./pages/encyclopedia/GameLocationIndexPage"), "GameLocationIndexPage");
const LocationIndexPage = lazyPage(() => import("./pages/encyclopedia/LocationIndexPage"), "LocationIndexPage");
const LocationPage = lazyPage(() => import("./pages/encyclopedia/LocationPage"), "LocationPage");

function NotFoundPage() {
  useDocumentTitle("Page Not Found");
  return (
    <main className="encyclopedia-page">
      <section className="content-card not-found-card">
        <h1>Page not found</h1>
        <p className="muted">This page doesn't exist or hasn't been seeded yet.</p>
        <div className="not-found-links">
          <Link to="/" className="primary-link">Return home</Link>
          <Link to="/search" className="secondary-link">Search the encyclopedia</Link>
        </div>
      </section>
    </main>
  );
}

function AppRoutes() {
  const { loading, error, source } = useEncyclopediaData();

  if (loading) {
    return <LoadingSpinner title="Loading encyclopedia data" body="Preparing the local dataset and route index." />;
  }

  return (
    <>
      {source === "seed" && error ? (
        <main className="encyclopedia-page">
          <section className="content-card">
            <h1>Generated dataset unavailable</h1>
            <p className="muted">{error}</p>
            <p className="muted">The app is using the built-in seed fallback until the full dataset is generated.</p>
            <button type="button" className="primary-link" onClick={() => window.location.reload()}>Retry</button>
          </section>
        </main>
      ) : null}
      <Suspense fallback={<LoadingSpinner title="Loading page" body="Opening the next encyclopedia route." />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/dex/national" element={<NationalDexPage />} />
          <Route path="/trainers" element={<TrainerIndexPage />} />
          <Route path="/trainers/appearances" element={<TrainerAppearanceIndexPage />} />
          <Route path="/trainers/:trainerSlug" element={<TrainerDetailPage />} />
          <Route path="/trainers/:trainerSlug/appearances/:appearanceSlug" element={<TrainerAppearancePage />} />
          <Route path="/pokemon/:speciesSlug" element={<PokemonDetailPage />} />
          <Route path="/pokemon/:speciesSlug/moves" element={<PokemonMovesPage />} />
          <Route path="/pokemon/:speciesSlug/forms/:formSlug" element={<PokemonFormPage />} />
          <Route path="/moves" element={<MoveIndexPage />} />
          <Route path="/moves/:moveSlug" element={<MoveDetailPage />} />
          <Route path="/abilities" element={<AbilityIndexPage />} />
          <Route path="/abilities/:abilitySlug" element={<AbilityDetailPage />} />
          <Route path="/items" element={<ItemIndexPage />} />
          <Route path="/items/:itemSlug" element={<ItemDetailPage />} />
          <Route path="/types" element={<TypeIndexPage />} />
          <Route path="/types/:typeSlug" element={<TypeDetailPage />} />
          <Route path="/regions" element={<RegionIndexPage />} />
          <Route path="/regions/:regionSlug" element={<RegionPage />} />
          <Route path="/games" element={<GameIndexPage />} />
          <Route path="/games/:gameSlug" element={<GameVersionPage />} />
          <Route path="/games/:gameSlug/pokemon" element={<GamePokemonIndexPage />} />
          <Route path="/games/:gameSlug/trainers" element={<GameTrainerIndexPage />} />
          <Route path="/games/:gameSlug/locations" element={<GameLocationIndexPage />} />
          <Route path="/locations" element={<LocationIndexPage />} />
          <Route path="/locations/:locationSlug" element={<LocationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AppShell>
      <EncyclopediaDataProvider>
        <AppRoutes />
      </EncyclopediaDataProvider>
    </AppShell>
  );
}
