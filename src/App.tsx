/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/pay/:id" element={<Payment />} />
    </Routes>
  );
}
