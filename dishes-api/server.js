const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(bodyParser.json());


const readDB = () => {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};


app.post('/dishes', (req, res) => {
  const { name, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: "Name, price and category are required" });
  }

  try {
    const db = readDB();
    const newId = db.dishes.length ? db.dishes[db.dishes.length - 1].id + 1 : 1;

    const newDish = { id: newId, name, price, category };
    db.dishes.push(newDish);
    writeDB(db);

    return res.status(201).json(newDish);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/dishes', (req, res) => {
  try {
    const db = readDB();
    res.status(200).json(db.dishes);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const db = readDB();
    const dish = db.dishes.find(d => d.id === id);
    if (!dish) return res.status(404).json({ error: "Dish not found" });

    res.status(200).json(dish);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put('/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, category } = req.body;

  if (!name && !price && !category) {
    return res.status(400).json({ error: "At least one field (name, price or category) is required to update" });
  }

  try {
    const db = readDB();
    const dishIndex = db.dishes.findIndex(d => d.id === id);

    if (dishIndex === -1) {
      return res.status(404).json({ error: "Dish not found" });
    }


    if (name) db.dishes[dishIndex].name = name;
    if (price) db.dishes[dishIndex].price = price;
    if (category) db.dishes[dishIndex].category = category;

    writeDB(db);
    res.status(200).json(db.dishes[dishIndex]);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete('/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const db = readDB();
    const dishIndex = db.dishes.findIndex(d => d.id === id);
    if (dishIndex === -1) return res.status(404).json({ error: "Dish not found" });

    db.dishes.splice(dishIndex, 1);
    writeDB(db);

    res.status(200).json({ message: `Dish with id ${id} deleted` });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/dishes/get', (req, res) => {
  const nameQuery = req.query.name;

  if (!nameQuery) {
    return res.status(400).json({ error: "Query parameter 'name' is required" });
  }

  try {
    const db = readDB();
    const results = db.dishes.filter(d =>
      d.name.toLowerCase().includes(nameQuery.toLowerCase())
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "No dishes found" });
    }

    res.status(200).json(results);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
