import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/encyclopedia/AppShell";
import { EncyclopediaDataProvider, useEncyclopediaData } from "./hooks/useEncyclopediaData";
import { AbilityDetailPage } from "./pages/encyclopedia/AbilityDetailPage";
import { AbilityIndexPage } from "./pages/encyclopedia/AbilityIndexPage";
import { ComparePage } from "./pages/encyclopedia/ComparePage";
import { GameIndexPage } from "./pages/encyclopedia/GameIndexPage";
import { GameLocationIndexPage } from "./pages/encyclopedia/GameLocationIndexPage";
import { GamePokemonIndexPage } from "./pages/encyclopedia/GamePokemonIndexPage";
import { GameTrainerIndexPage } from "./pages/encyclopedia/GameTrainerIndexPage";
import { GameVersionPage } from "./pages/encyclopedia/GameVersionPage";
import { HomePage } from "./pages/encyclopedia/HomePage";
import { ItemDetailPage } from "./pages/encyclopedia/ItemDetailPage";
import { ItemIndexPage } from "./pages/encyclopedia/ItemIndexPage";
import { LocationIndexPage } from "./pages/encyclopedia/LocationIndexPage";
import { LocationPage } from "./pages/encyclopedia/LocationPage";
import { MoveDetailPage } from "./pages/encyclopedia/MoveDetailPage";
import { MoveIndexPage } from "./pages/encyclopedia/MoveIndexPage";
import { NationalDexPage } from "./pages/encyclopedia/NationalDexPage";
import { PokemonDetailPage } from "./pages/encyclopedia/PokemonDetailPage";
import { PokemonFormPage } from "./pages/encyclopedia/PokemonFormPage";
import { PokemonMovesPage } from "./pages/encyclopedia/PokemonMovesPage";
import { RegionIndexPage } from "./pages/encyclopedia/RegionIndexPage";
import { RegionPage } from "./pages/encyclopedia/RegionPage";
import { SearchPage } from "./pages/encyclopedia/SearchPage";
import { TrainerAppearanceIndexPage } from "./pages/encyclopedia/TrainerAppearanceIndexPage";
import { TrainerDetailPage } from "./pages/encyclopedia/TrainerDetailPage";
import { TrainerIndexPage } from "./pages/encyclopedia/TrainerIndexPage";
import { TrainerAppearancePage } from "./pages/encyclopedia/TrainerAppearancePage";
import { TypeIndexPage } from "./pages/encyclopedia/TypeIndexPage";
import { TypeDetailPage } from "./pages/encyclopedia/TypeDetailPage";

function NotFoundPage() {
  return (
    <main className="encyclopedia-page">
      <section className="content-card">
        <h1>Page not found</h1>
        <p className="muted">The route exists in the encyclopedia shell, but this entity is not seeded yet.</p>
      </section>
    </main>
  );
}

function AppRoutes() {
  const { loading, error, source } = useEncyclopediaData();

  if (loading) {
    return (
      <main className="encyclopedia-page">
        <section className="content-card">
          <h1>Loading encyclopedia data</h1>
          <p className="muted">Preparing the local dataset and route index.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {source === "seed" && error ? (
        <main className="encyclopedia-page">
          <section className="content-card">
            <h1>Generated dataset unavailable</h1>
            <p className="muted">{error}</p>
            <p className="muted">The app is using the built-in seed fallback until `public/data/encyclopedia/index.json` is generated.</p>
          </section>
        </main>
      ) : null}
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
