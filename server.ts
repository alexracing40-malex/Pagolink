import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory database
interface Order {
  id: string;
  amount: number;
  concept: string;
  client?: string;
  reference: string;
  status: "pending" | "paid";
  createdAt: number;
}

const orders = new Map<string, Order>();

// Bank configuration in-memory
let bankConfig = {
  name: process.env.VITE_BANK_NAME || "BBVA",
  clabe: process.env.VITE_BANK_CLABE || "012180015555555555",
  owner: process.env.VITE_BANK_OWNER || "Mi Empresa S.A. de C.V."
};

// Generate a readable, non-ambiguous 6-character alphanumeric reference
function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, 1, O, 0 for readibility
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Ensure unique reference
function getUniqueReference(): string {
  let ref = generateReference();
  let attempts = 0;
  // Basic collision check against our map
  const isReferenceTaken = (r: string) => Array.from(orders.values()).some((o) => o.reference === r);
  while (isReferenceTaken(ref) && attempts < 10) {
    ref = generateReference();
    attempts++;
  }
  return ref;
}

// --- API ROUTES ---

// Get global bank configuration
app.get("/api/config", (req, res) => {
  res.json(bankConfig);
});

// Update global bank configuration
app.put("/api/config", (req, res) => {
  const { name, clabe, owner } = req.body;
  if (name !== undefined) bankConfig.name = name;
  if (clabe !== undefined) bankConfig.clabe = clabe;
  if (owner !== undefined) bankConfig.owner = owner;
  res.json(bankConfig);
});

// Create a new order link
app.post("/api/orders", (req, res) => {
  const { amount, concept, client } = req.body;

  if (!amount || amount <= 0 || !concept) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const id = crypto.randomUUID();
  const reference = getUniqueReference();

  const newOrder: Order = {
    id,
    amount: parseFloat(amount),
    concept,
    client: client || "",
    reference,
    status: "pending",
    createdAt: Date.now(),
  };

  orders.set(id, newOrder);

  res.status(201).json(newOrder);
});

// Get a specific order
app.get("/api/orders/:id", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

// Get all orders (for merchant dashboard)
app.get("/api/orders", (req, res) => {
  const allOrders = Array.from(orders.values()).sort((a, b) => b.createdAt - a.createdAt);
  res.json(allOrders);
});

// Mark order as paid
app.post("/api/orders/:id/pay", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  
  order.status = "paid";
  orders.set(req.params.id, order);
  
  res.json(order);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
