const pool = require("./pool");

exports.getCategoryByUri = async (uri) => {
  const { rows } = await pool.query("SELECT * FROM categories WHERE uri = $1", [
    uri,
  ]);
  return rows;
};

exports.getPlantsByCategory = async (category_id) => {
  const { rows } = await pool.query(
    `
        SELECT p.name, p.description, p.inStock, p.price, c.name as c_name, p.uri as p_uri, c.uri as c_uri, p.imageUrl 
        FROM (SELECT *, UNNEST(category) as cat FROM plants) p 
        JOIN categories c ON p.cat = c.id
        WHERE p.cat = $1;
        `,
    [category_id]
  );
  return rows;
};

exports.getPlantByUri = async (uri) => {
  const { rows } = await pool.query("SELECT * FROM plants WHERE uri = $1", [
    uri,
  ]);
  return rows;
};

exports.getAllCategories = async () => {
  const { rows } = await pool.query("SELECT * FROM categories");
  return rows;
};

exports.createNewPlant = async (plant) => {
  await pool.query(
    "INSERT INTO plants (name, description, inStock, price, category, uri, imageUrl) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      plant.name,
      plant.description,
      plant.inStock,
      plant.price,
      plant.category,
      plant.uri,
      plant.imageUrl,
    ]
  );
};
