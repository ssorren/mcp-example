const express = require('express');
const app = express();
const PORT = process.env.PORT || 9080;

// Sample users
const users = {
  "a1b2c3d4": "Alice Johnson",
  "e5f6g7h8": "Bob Smith",
  "i9j0k1l2": "Charlie Lee",
  "m3n4o5p6": "Diana Evans",
  "q7r8s9t0": "Ethan Brown",
  "u1v2w3x4": "Fiona Clark",
  "y5z6a7b8": "George Harris",
  "c9d0e1f2": "Hannah Lewis",
  "g3h4i5j6": "Ian Walker",
  "k7l8m9n0": "Julia Turner"
};

// Sample orders
const orders = [
  { id: "ord001", name: "Sugar (50kg)", userId: "a1b2c3d4" },
  { id: "ord002", name: "Cleaning Supplies Pack", userId: "a1b2c3d4" },
  { id: "ord003", name: "Canned Tomatoes (100 cans)", userId: "a1b2c3d4" },

  { id: "ord004", name: "Flour (100kg)", userId: "e5f6g7h8" },
  { id: "ord005", name: "Dish Soap (10 bottles)", userId: "e5f6g7h8" },
  { id: "ord006", name: "Salt (25kg)", userId: "e5f6g7h8" },

  { id: "ord007", name: "Olive Oil (20L)", userId: "i9j0k1l2" },
  { id: "ord008", name: "Baking Powder (10kg)", userId: "i9j0k1l2" },

  { id: "ord009", name: "Rice (200kg)", userId: "m3n4o5p6" },
  { id: "ord010", name: "Vegetable Oil (15L)", userId: "m3n4o5p6" },
  { id: "ord011", name: "Pasta (80kg)", userId: "m3n4o5p6" },
  { id: "ord012", name: "Canned Beans (50 cans)", userId: "m3n4o5p6" },

  { id: "ord013", name: "Toilet Paper (Case of 48)", userId: "q7r8s9t0" },
  { id: "ord014", name: "Hand Sanitizer (20 bottles)", userId: "q7r8s9t0" },

  { id: "ord015", name: "Laundry Detergent (10L)", userId: "u1v2w3x4" },
  { id: "ord016", name: "Trash Bags (100 ct)", userId: "u1v2w3x4" },
  { id: "ord017", name: "Disinfectant Spray (5 bottles)", userId: "u1v2w3x4" },

  { id: "ord018", name: "Coffee Beans (30kg)", userId: "k7l8m9n0" },
  { id: "ord019", name: "Tea Bags (500ct)", userId: "k7l8m9n0" },
  { id: "ord020", name: "Condensed Milk (40 cans)", userId: "k7l8m9n0" },

  { id: "ord021", name: "Paper Towels (24 rolls)", userId: "g3h4i5j6" },
  { id: "ord022", name: "Broom & Mop Set", userId: "g3h4i5j6" },

  { id: "ord023", name: "Cereal (20 boxes)", userId: "c9d0e1f2" },
  { id: "ord024", name: "Powdered Milk (10kg)", userId: "c9d0e1f2" },
  { id: "ord025", name: "Snacks Variety Pack", userId: "c9d0e1f2" },

  { id: "ord026", name: "Cooking Gas Cylinder", userId: "y5z6a7b8" },
  { id: "ord027", name: "Napkins (1000ct)", userId: "y5z6a7b8" }
];

// Root
app.get('/', (req, res) => {
  res.json({ name: "Sample Users API" });
});

// GET /users → all users
app.get('/users', (req, res) => {
  const list = Object.entries(users).map(([uid, fullName]) => ({ id: uid, fullName }));
  res.json(list);
});

// GET /users/:id → single user
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const fullName = users[id];
  return fullName
    ? res.json({ id, fullName })
    : res.status(404).json({ error: 'User not found' });
});

// GET /orders → all orders
app.get('/orders', (req, res) => {
  res.json(orders);
});

// GET /users/:userId/orders → orders for a user
app.get('/users/:userId/orders', (req, res) => {
  const { userId } = req.params;
  if (!users[userId]) return res.status(404).json({ error: 'User not found' });
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

// OpenAPI spec
app.get('/openapi', (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: { title: "Sample Users API", version: "1.1.0" },
    paths: {
      "/": {
        get: {
          summary: "Root endpoint",
          responses: {
            "200": {
              description: "API name",
              content: {
                "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } }
              }
            }
          }
        }
      },
      "/users": {
        get: {
          summary: "List all users",
          responses: {
            "200": {
              description: "List of users",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { type: "object", properties: { id: { type: "string" }, fullName: { type: "string" } } }
                  }
                }
              }
            }
          }
        }
      },
      "/users/{id}": {
        get: {
          summary: "Get a user by ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            "200": {
              description: "User",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { id: { type: "string" }, fullName: { type: "string" } } }
                }
              }
            },
            "404": {
              description: "User not found",
              content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } }
            }
          }
        }
      },
      "/orders": {
        get: {
          summary: "List all orders",
          responses: {
            "200": {
              description: "List of orders",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        userId: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/users/{userId}/orders": {
        get: {
          summary: "List orders for a user",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "string" } }
          ],
          responses: {
            "200": {
              description: "List of orders for user",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        userId: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            "404": {
              description: "User not found",
              content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } }
            }
          }
        }
      }
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
