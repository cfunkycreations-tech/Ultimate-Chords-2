/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Song } from "./pages/Song";
import { Tuner } from "./pages/Tuner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="song/:artist/:title" element={<Song />} />
          <Route path="tuner" element={<Tuner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
