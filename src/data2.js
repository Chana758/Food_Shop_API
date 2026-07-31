const PRODUCTS = [
  // --- 1. Main Dish ---
  
  { name: "Lemongrass Chicken", price: 6.00, discount: 0, stockQty: 25, sku: "MAIN-003", prepTime: 15, description: "Stir-fried chicken with lemongrass", active: true, featured: true, image: "lemongrass-chicken.jpg" },
  { name: "Stir-Fried Morning Glory", price: 4.00, discount: 0, stockQty: 40, sku: "MAIN-004", prepTime: 8, description: "Fresh morning glory with garlic", active: true, featured: false, image: "morning-glory.jpg" },
  { name: "Sweet and Sour Pork", price: 5.50, discount: 0, stockQty: 20, sku: "MAIN-005", prepTime: 12, description: "Classic sweet and sour pork", active: true, featured: false, image: "sweet-sour-pork.jpg" },
  { name: "Beef Lok Lak", price: 7.50, discount: 0, stockQty: 18, sku: "MAIN-006", prepTime: 15, description: "Tender beef with pepper sauce", active: true, featured: true, image: "beef-lok-lak.jpg" },
  { name: "Stir-Fried Beef Kroeung", price: 7.00, discount: 0, stockQty: 15, sku: "MAIN-007", prepTime: 15, description: "Beef with traditional Khmer paste", active: true, featured: false, image: "beef-kroeung.jpg" },
  { name: "Prahok Ktis", price: 5.00, discount: 0, stockQty: 30, sku: "MAIN-008", prepTime: 10, description: "Fermented fish dip with veggies", active: true, featured: false, image: "prahok-ktis.jpg" },
  { name: "Braised Pork Belly", price: 6.50, discount: 0, stockQty: 12, sku: "MAIN-009", prepTime: 30, description: "Slow-cooked savory pork belly", active: true, featured: false, image: "braised-pork.jpg" },
  { name: "Stir-Fried Kailan", price: 4.50, discount: 0, stockQty: 35, sku: "MAIN-010", prepTime: 8, description: "Crispy kailan with oyster sauce", active: true, featured: false, image: "kailan.jpg" },

  // --- 2. Soup ---
  { name: "Samlor Machu Kreung", price: 5.00, discount: 0, stockQty: 20, sku: "SOUP-001", prepTime: 20, description: "Sour soup with Khmer paste", active: true, featured: true, image: "samlor-machu.jpg" },
  { name: "Samlor Korko", price: 5.50, discount: 0, stockQty: 15, sku: "SOUP-002", prepTime: 25, description: "Traditional mixed vegetable soup", active: true, featured: false, image: "samlor-korko.jpg" },
  { name: "Chicken Soup", price: 4.50, discount: 0, stockQty: 30, sku: "SOUP-003", prepTime: 15, description: "Light and healthy chicken soup", active: true, featured: false, image: "chicken-soup.jpg" },
  { name: "Pork Rib Soup", price: 5.00, discount: 0, stockQty: 25, sku: "SOUP-004", prepTime: 20, description: "Savory pork rib broth", active: true, featured: false, image: "pork-rib-soup.jpg" },

  { name: "Fish Sour Soup", price: 4.80, discount: 0, stockQty: 20, sku: "SOUP-005", prepTime: 15, description: "Tangy fish soup", active: true, featured: false, image: "fish-sour-soup.jpg" },
  { name: "Mixed Vegetable Soup", price: 4.00, discount: 0, stockQty: 35, sku: "SOUP-006", prepTime: 10, description: "Fresh garden vegetable soup", active: true, featured: false, image: "veg-soup.jpg" },
  { name: "Meatball Soup", price: 4.50, discount: 0, stockQty: 25, sku: "SOUP-007", prepTime: 15, description: "Homemade pork meatball soup", active: true, featured: false, image: "meatball-soup.jpg" },
  { name: "Banana Blossom Soup", price: 4.50, discount: 0, stockQty: 15, sku: "SOUP-008", prepTime: 20, description: "Unique banana flower soup", active: true, featured: false, image: "banana-blossom-soup.jpg" },
  { name: "Smoked Fish Soup", price: 5.00, discount: 0, stockQty: 20, sku: "SOUP-009", prepTime: 20, description: "Flavorful smoked fish broth", active: true, featured: false, image: "smoked-fish-soup.jpg" },
  { name: "Clear Bone Broth", price: 4.00, discount: 0, stockQty: 40, sku: "SOUP-010", prepTime: 30, description: " ", active: true, featured: false, image: "clear-soup.jpg" },

  // --- 3. Drinks ---
  { name: "Sugarcane Juice", price: 1.50, discount: 0, stockQty: 100, sku: "DRNK-001", prepTime: 3, description: "Freshly pressed sugarcane", active: true, featured: true, image: "sugarcane.jpg" },
  { name: "Fresh Coconut Water", price: 2.00, discount: 0, stockQty: 80, sku: "DRNK-002", prepTime: 2, description: "Cooling coconut water", active: true, featured: true, image: "coconut.jpg" },
  { name: "Iced Tea", price: 1.00, discount: 0, stockQty: 150, sku: "DRNK-003", prepTime: 1, description: "Classic iced black tea", active: true, featured: false, image: "iced-tea.jpg" },
  { name: "Lime Juice", price: 1.50, discount: 0, stockQty: 60, sku: "DRNK-004", prepTime: 2, description: "Refreshing lime cooler", active: true, featured: false, image: "lime-juice.jpg" },
  { name: "Mango Smoothie", price: 2.50, discount: 0, stockQty: 50, sku: "DRNK-005", prepTime: 4, description: "Creamy ripe mango blend", active: true, featured: true, image: "mango-smoothie.jpg" },
  { name: "Palm Juice", price: 1.80, discount: 0, stockQty: 40, sku: "DRNK-006", prepTime: 2, description: "Sweet palm tree sap", active: true, featured: false, image: "palm-juice.jpg" },
  { name: "Soy Milk", price: 1.20, discount: 0, stockQty: 70, sku: "DRNK-007", prepTime: 1, description: "Fresh soy milk", active: true, featured: false, image: "soy-milk.jpg" },
  { name: "Strawberry Juice", price: 2.00, discount: 0, stockQty: 50, sku: "DRNK-008", prepTime: 3, description: "Fresh strawberry drink", active: true, featured: false, image: "strawberry-juice.jpg" },
  { name: "Fruit Smoothie", price: 2.50, discount: 0, stockQty: 45, sku: "DRNK-009", prepTime: 4, description: "Mixed fruit delight", active: true, featured: false, image: "mixed-fruit.jpg" },
  { name: "Custard Apple Smoothie", price: 2.80, discount: 0, stockQty: 30, sku: "DRNK-010", prepTime: 4, description: "Exotic custard apple blend", active: true, featured: false, image: "custard-apple.jpg" },

  // --- 4. Coffee ---
  { name: "Iced Black Coffee", price: 1.50, discount: 0, stockQty: 100, sku: "COFF-001", prepTime: 2, description: "Strong iced black coffee", active: true, featured: true, image: "black-coffee.jpg" },
  { name: "Iced Coffee with Milk", price: 1.80, discount: 0, stockQty: 100, sku: "COFF-002", prepTime: 2, description: "Coffee with sweet condensed milk", active: true, featured: true, image: "coffee-milk.jpg" },
  { name: "Espresso", price: 2.00, discount: 0, stockQty: 50, sku: "COFF-003", prepTime: 1, description: "Rich shot of espresso", active: true, featured: false, image: "espresso.jpg" },
  { name: "Cappuccino", price: 2.50, discount: 0, stockQty: 40, sku: "COFF-004", prepTime: 3, description: "Frothy cappuccino", active: true, featured: false, image: "cappuccino.jpg" },
  { name: "Latte", price: 2.50, discount: 0, stockQty: 40, sku: "COFF-005", prepTime: 3, description: "Smooth cafe latte", active: true, featured: false, image: "latte.jpg" },
  { name: "Mocha", price: 2.80, discount: 0, stockQty: 30, sku: "COFF-006", prepTime: 3, description: "Chocolate flavored coffee", active: true, featured: false, image: "mocha.jpg" },
  { name: "Coffee Frappe", price: 3.00, discount: 0, stockQty: 30, sku: "COFF-007", prepTime: 4, description: "Blended coffee drink", active: true, featured: false, image: "coffee-frappe.jpg" },
  { name: "Butter Coffee", price: 2.20, discount: 0, stockQty: 20, sku: "COFF-008", prepTime: 3, description: "Rich butter infused coffee", active: true, featured: false, image: "butter-coffee.jpg" },
  { name: "Palm Sugar Coffee", price: 2.50, discount: 0, stockQty: 35, sku: "COFF-009", prepTime: 3, description: "Coffee sweetened with palm sugar", active: true, featured: true, image: "palm-coffee.jpg" },
  { name: "Americano", price: 2.00, discount: 0, stockQty: 50, sku: "COFF-010", prepTime: 2, description: "Diluted espresso shot", active: true, featured: false, image: "americano.jpg" },

  // --- 5. Dessert ---
  { name: "Sticky Rice with Mango", price: 3.00, discount: 0, stockQty: 40, sku: "DESS-001", prepTime: 5, description: "Ripe mango with coconut sticky rice", active: true, featured: true, image: "mango-sticky-rice.jpg" },
  { name: "Banana in Coconut Milk", price: 2.50, discount: 0, stockQty: 30, sku: "DESS-002", prepTime: 10, description: "Warm banana dessert", active: true, featured: false, image: "banana-coconut.jpg" },
  { name: "Fried Banana", price: 2.00, discount: 0, stockQty: 50, sku: "DESS-003", prepTime: 5, description: "Crispy fried banana snack", active: true, featured: false, image: "fried-banana.jpg" },
  { name: "Tapioca Pearls", price: 2.00, discount: 0, stockQty: 40, sku: "DESS-004", prepTime: 5, description: "Chewy tapioca dessert", active: true, featured: false, image: "tapioca.jpg" },
  { name: "Ansom Cake", price: 2.50, discount: 0, stockQty: 25, sku: "DESS-005", prepTime: 60, description: "Sticky rice cake", active: true, featured: true, image: "ansom-cake.jpg" },

  { name: "Mixed Fruit Platter", price: 3.00, discount: 0, stockQty: 30, sku: "DESS-006", prepTime: 5, description: "Fresh seasonal fruits", active: true, featured: false, image: "fruit-platter.jpg" },
  { name: "Sweet Noodles", price: 2.00, discount: 0, stockQty: 35, sku: "DESS-007", prepTime: 5, description: "Sweet chilled noodles", active: true, featured: false, image: "sweet-noodles.jpg" },
  { name: "Rice Noodle Dessert", price: 2.20, discount: 0, stockQty: 30, sku: "DESS-008", prepTime: 5, description: "Dessert noodles in syrup", active: true, featured: false, image: "noodle-dessert.jpg" },
  { name: "Palm Fruit Dessert", price: 2.50, discount: 0, stockQty: 20, sku: "DESS-009", prepTime: 5, description: "Refreshing palm fruit drink", active: true, featured: false, image: "palm-dessert.jpg" },
  { name: "Traditional Khmer Cake", price: 2.00, discount: 0, stockQty: 20, sku: "DESS-010", prepTime: 5, description: "Authentic Khmer cake", active: true, featured: false, image: "khmer-cake.jpg" },

  // --- 6. Snack ---
  { name: "Spring Rolls", price: 3.00, discount: 0, stockQty: 50, sku: "SNAC-001", prepTime: 10, description: "Crispy fried spring rolls", active: true, featured: true, image: "spring-rolls.jpg" },
  { name: "Grilled Sausage", price: 2.00, discount: 0, stockQty: 60, sku: "SNAC-002", prepTime: 8, description: "Savory grilled sausage", active: true, featured: false, image: "sausage.jpg" },
  { name: "Fried Fish Balls", price: 2.50, discount: 0, stockQty: 40, sku: "SNAC-003", prepTime: 5, description: "Fried fish snacks", active: true, featured: false, image: "fish-balls.jpg" },
  { name: "Cassava Chips", price: 2.00, discount: 0, stockQty: 50, sku: "SNAC-004", prepTime: 5, description: "Crunchy cassava chips", active: true, featured: false, image: "cassava-chips.jpg" },
  { name: "Steamed Bun", price: 1.50, discount: 0, stockQty: 40, sku: "SNAC-005", prepTime: 5, description: "Fluffy meat bun", active: true, featured: false, image: "meat-bun.jpg" },

  { name: "Grilled Corn", price: 1.50, discount: 0, stockQty: 50, sku: "SNAC-006", prepTime: 10, description: "Char-grilled corn on cob", active: true, featured: false, image: "grilled-corn.jpg" },
  { name: "Fried Pork", price: 3.00, discount: 0, stockQty: 30, sku: "SNAC-007", prepTime: 8, description: "Crispy fried pork strips", active: true, featured: false, image: "fried-pork.jpg" },
  { name: "Fried Tofu", price: 2.50, discount: 0, stockQty: 40, sku: "SNAC-008", prepTime: 5, description: "Crispy golden tofu", active: true, featured: false, image: "fried-tofu.jpg" },
  { name: "Hot Dog", price: 1.50, discount: 0, stockQty: 40, sku: "SNAC-009", prepTime: 5, description: "Classic hot dog snack", active: true, featured: false, image: "hotdog.jpg" },
  { name: "Bamboo Sticky Rice", price: 2.50, discount: 0, stockQty: 25, sku: "SNAC-010", prepTime: 30, description: "Sticky rice in bamboo", active: true, featured: false, image: "bamboo-rice.jpg" },

  // --- 7. Breakfast ---
  { name: "Pork and Rice", price: 3.50, discount: 0, stockQty: 50, sku: "BREA-001", prepTime: 10, description: "Classic pork with rice", active: true, featured: true, image: "pork-rice.jpg" },
  { name: "Num Banh Chok", price: 3.50, discount: 0, stockQty: 40, sku: "BREA-002", prepTime: 10, description: "Khmer noodles with gravy", active: true, featured: true, image: "num-banh-chok.jpg" },
  { name: "Kuy Teav", price: 4.00, discount: 0, stockQty: 40, sku: "BREA-003", prepTime: 10, description: "Noodle soup breakfast", active: true, featured: false, image: "kuy-teav.jpg" },
  { name: "Chicken Porridge", price: 3.00, discount: 0, stockQty: 30, sku: "BREA-004", prepTime: 15, description: "Savory chicken congee", active: true, featured: false, image: "chicken-porridge.jpg" },
  { name: "Pork Congee", price: 3.50, discount: 0, stockQty: 30, sku: "BREA-005", prepTime: 15, description: "Hearty pork congee", active: true, featured: false, image: "pork-congee.jpg" },

  { name: "Baguette with Pate", price: 3.00, discount: 0, stockQty: 30, sku: "BREA-006", prepTime: 5, description: "Crunchy pate sandwich", active: true, featured: false, image: "baguette.jpg" },
  { name: "Omelet with Rice", price: 3.00, discount: 0, stockQty: 40, sku: "BREA-007", prepTime: 8, description: "Simple egg and rice", active: true, featured: false, image: "omelet-rice.jpg" },
  { name: "Fried Rice", price: 3.50, discount: 0, stockQty: 40, sku: "BREA-008", prepTime: 10, description: "Wok-fried breakfast rice", active: true, featured: false, image: "fried-rice-b.jpg" },
  { name: "Spicy Noodles", price: 4.00, discount: 0, stockQty: 30, sku: "BREA-009", prepTime: 10, description: "Hot and spicy noodles", active: true, featured: false, image: "spicy-noodles.jpg" },
  { name: "Mee Sua", price: 3.50, discount: 0, stockQty: 30, sku: "BREA-010", prepTime: 10, description: "Traditional mee sua", active: true, featured: false, image: "mee-sua.jpg" },

  // --- 8. Noodles ---
  { name: "Beef Stew Noodles", price: 4.50, discount: 0, stockQty: 30, sku: "NOOD-001", prepTime: 15, description: "Rich beef stew with noodles", active: true, featured: true, image: "beef-stew-noodles.jpg" },
  { name: "Rice Noodle Rolls", price: 4.00, discount: 0, stockQty: 30, sku: "NOOD-002", prepTime: 10, description: "Steamed rolls with sauce", active: true, featured: false, image: "noodle-rolls.jpg" },
  { name: "Mee Kola", price: 3.50, discount: 0, stockQty: 40, sku: "NOOD-003", prepTime: 10, description: "Traditional Kola noodles", active: true, featured: false, image: "mee-kola.jpg" },
  { name: "Banh Hoy", price: 4.00, discount: 0, stockQty: 30, sku: "NOOD-004", prepTime: 10, description: "Delicate thin noodles", active: true, featured: false, image: "banh-hoy.jpg" },
  { name: "Chicken Stir-Fried Noodles", price: 4.00, discount: 0, stockQty: 35, sku: "NOOD-005", prepTime: 12, description: "Chicken wok-tossed noodles", active: true, featured: false, image: "chicken-stir-noodles.jpg" },
  
  { name: "Pork Rib Noodles", price: 4.50, discount: 0, stockQty: 25, sku: "NOOD-006", prepTime: 15, description: "Tender pork rib noodle soup", active: true, featured: false, image: "pork-rib-noodles.jpg" },
  { name: "Wonton Noodles", price: 4.00, discount: 0, stockQty: 30, sku: "NOOD-007", prepTime: 12, description: "Classic wonton noodle soup", active: true, featured: false, image: "wonton-noodles.jpg" },
  { name: "Minced Pork Noodles", price: 4.00, discount: 0, stockQty: 35, sku: "NOOD-008", prepTime: 10, description: "Savory minced pork noodles", active: true, featured: false, image: "minced-pork-noodles.jpg" },
  { name: "Noodle Soup", price: 4.00, discount: 0, stockQty: 40, sku: "NOOD-009", prepTime: 10, description: "Clear savory noodle soup", active: true, featured: false, image: "noodle-soup.jpg" },
  { name: "Cold Noodles", price: 4.50, discount: 0, stockQty: 20, sku: "NOOD-010", prepTime: 10, description: "Refreshing cold noodle dish", active: true, featured: false, image: "cold-noodles.jpg" },

  // --- 9. Salad ---
  { name: "Green Mango Salad", price: 3.50, discount: 0, stockQty: 40, sku: "SALA-001", prepTime: 10, description: "Tangy green mango salad", active: true, featured: true, image: "mango-salad.jpg" },
  { name: "Banana Blossom Salad", price: 3.80, discount: 0, stockQty: 30, sku: "SALA-002", prepTime: 10, description: "Crispy banana flower salad", active: true, featured: false, image: "banana-salad.jpg" },
  { name: "Papaya Salad", price: 3.50, discount: 0, stockQty: 40, sku: "SALA-003", prepTime: 10, description: "Spicy green papaya salad", active: true, featured: true, image: "papaya-salad.jpg" },
  { name: "Beef Salad", price: 5.00, discount: 0, stockQty: 25, sku: "SALA-004", prepTime: 12, description: "Tender beef salad", active: true, featured: false, image: "beef-salad.jpg" },
  { name: "Fish Salad", price: 4.50, discount: 0, stockQty: 20, sku: "SALA-005", prepTime: 10, description: "Fresh fish salad", active: true, featured: false, image: "fish-salad.jpg" },
  { name: "Noodle Salad", price: 4.00, discount: 0, stockQty: 30, sku: "SALA-006", prepTime: 10, description: "Chilled noodle salad", active: true, featured: false, image: "noodle-salad.jpg" },
  { name: "Seafood Salad", price: 6.00, discount: 0, stockQty: 15, sku: "SALA-007", prepTime: 15, description: "Fresh seafood medley salad", active: true, featured: false, image: "seafood-salad.jpg" },
  { name: "Fresh Vegetable Salad", price: 3.00, discount: 0, stockQty: 50, sku: "SALA-008", prepTime: 5, description: "Healthy fresh salad", active: true, featured: false, image: "veg-salad.jpg" },
  { name: "Chicken Feet Salad", price: 4.00, discount: 0, stockQty: 20, sku: "SALA-009", prepTime: 10, description: "Spicy chicken feet salad", active: true, featured: false, image: "chicken-feet-salad.jpg" },
  { name: "Water Hyacinth Salad", price: 3.50, discount: 0, stockQty: 25, sku: "SALA-010", prepTime: 10, description: "Unique local herb salad", active: true, featured: false, image: "herb-salad.jpg" },

  // --- 10. Seafood ---
  { name: "Crab with Pepper", price: 8.50, discount: 0, stockQty: 15, sku: "SEAF-001", prepTime: 20, description: "Crab in Kampot pepper sauce", active: true, featured: true, image: "pepper-crab.jpg" },
  { name: "Grilled Prawns", price: 8.00, discount: 0, stockQty: 15, sku: "SEAF-002", prepTime: 15, description: "Char-grilled fresh prawns", active: true, featured: true, image: "grilled-prawns.jpg" },
  { name: "Sweet and Sour Fish", price: 7.00, discount: 0, stockQty: 15, sku: "SEAF-003", prepTime: 15, description: "Whole fish in sweet sauce", active: true, featured: false, image: "sweet-sour-fish.jpg" },
  { name: "Grilled Squid", price: 8.50, discount: 0, stockQty: 15, sku: "SEAF-004", prepTime: 15, description: "Perfectly grilled squid", active: true, featured: false, image: "grilled-squid.jpg" },
  { name: "Dried Fish", price: 5.00, discount: 0, stockQty: 30, sku: "SEAF-005", prepTime: 10, description: "Savory sun-dried fish", active: true, featured: false, image: "dried-fish.jpg" },
  { name: "Garlic Prawns", price: 8.00, discount: 0, stockQty: 15, sku: "SEAF-006", prepTime: 12, description: "Garlic stir-fried prawns", active: true, featured: false, image: "garlic-prawns.jpg" },
  { name: "Stir-Fried Snails", price: 6.00, discount: 0, stockQty: 15, sku: "SEAF-007", prepTime: 15, description: "Spicy stir-fried snails", active: true, featured: false, image: "snails.jpg" },
  { name: "Steamed Fish", price: 7.50, discount: 0, stockQty: 10, sku: "SEAF-008", prepTime: 20, description: "Healthy steamed fish", active: true, featured: false, image: "steamed-fish.jpg" },
  { name: "Fried Squid", price: 7.00, discount: 0, stockQty: 15, sku: "SEAF-009", prepTime: 12, description: "Crispy fried squid rings", active: true, featured: false, image: "fried-squid.jpg" },
  { name: "Steamed Crab", price: 9.00, discount: 0, stockQty: 10, sku: "SEAF-010", prepTime: 20, description: "Fresh steamed crab", active: true, featured: false, image: "steamed-crab.jpg" },

  // --- 11. Rice Dish ---
  { name: "Basil Fried Rice", price: 4.00, discount: 0, stockQty: 40, sku: "RICE-001", prepTime: 10, description: "Wok-fried rice with basil", active: true, featured: true, image: "basil-rice.jpg" },
  { name: "Chicken Fried Rice", price: 4.00, discount: 0, stockQty: 40, sku: "RICE-002", prepTime: 10, description: "Chicken and vegetable rice", active: true, featured: true, image: "chicken-rice.jpg" },
  { name: "Seafood Fried Rice", price: 5.00, discount: 0, stockQty: 30, sku: "RICE-003", prepTime: 12, description: "Loaded seafood fried rice", active: true, featured: false, image: "seafood-rice.jpg" },
  { name: "Egg Fried Rice", price: 3.50, discount: 0, stockQty: 50, sku: "RICE-004", prepTime: 8, description: "Classic egg fried rice", active: true, featured: false, image: "egg-rice.jpg" },
  { name: "Pork Fried Rice", price: 4.00, discount: 0, stockQty: 40, sku: "RICE-005", prepTime: 10, description: "Pork and egg fried rice", active: true, featured: false, image: "pork-rice-b.jpg" },
  { name: "Steamed Jasmine Rice", price: 1.00, discount: 0, stockQty: 100, sku: "RICE-006", prepTime: 2, description: "Fluffy jasmine rice", active: true, featured: false, image: "rice.jpg" },
  { name: "Smoked Meat Fried Rice", price: 4.50, discount: 0, stockQty: 30, sku: "RICE-007", prepTime: 12, description: "Smoky flavored fried rice", active: true, featured: false, image: "smoked-rice.jpg" },
  { name: "Garlic Fried Rice", price: 3.50, discount: 0, stockQty: 40, sku: "RICE-008", prepTime: 8, description: "Fragrant garlic fried rice", active: true, featured: false, image: "garlic-rice.jpg" },
  { name: "Sausage Fried Rice", price: 4.00, discount: 0, stockQty: 35, sku: "RICE-009", prepTime: 10, description: "Sausage and vegetable rice", active: true, featured: false, image: "sausage-rice.jpg" },
  { name: "Kailan Fried Rice", price: 3.80, discount: 0, stockQty: 35, sku: "RICE-010", prepTime: 10, description: "Green kailan fried rice", active: true, featured: false, image: "kailan-rice.jpg" },

  // --- 12. Khmer Curry ---
  { name: "Chicken Curry", price: 6.00, discount: 0, stockQty: 20, sku: "CURR-001", prepTime: 20, description: "Classic Khmer chicken curry", active: true, featured: true, image: "chicken-curry.jpg" },
  { name: "Beef Curry", price: 7.00, discount: 0, stockQty: 15, sku: "CURR-002", prepTime: 25, description: "Rich beef curry", active: true, featured: true, image: "beef-curry-b.jpg" },
  { name: "Seafood Curry", price: 8.00, discount: 0, stockQty: 15, sku: "CURR-003", prepTime: 20, description: "Seafood in curry sauce", active: true, featured: false, image: "seafood-curry.jpg" },
  { name: "Fish Curry", price: 6.50, discount: 0, stockQty: 20, sku: "CURR-004", prepTime: 20, description: "Traditional fish curry", active: true, featured: false, image: "fish-curry.jpg" },
  { name: "Vegetable Curry", price: 5.00, discount: 0, stockQty: 25, sku: "CURR-005", prepTime: 15, description: "Healthy veggie curry", active: true, featured: false, image: "veg-curry.jpg" },
  { name: "Fish Amok", price: 6.50, discount: 0, stockQty: 20, sku: "CURR-006", prepTime: 20, description: "Signature Khmer dish", active: true, featured: true, image: "amok.jpg" },
  { name: "Snail Amok", price: 6.00, discount: 0, stockQty: 15, sku: "CURR-007", prepTime: 20, description: "Unique snail curry dish", active: true, featured: false, image: "snail-amok.jpg" },
  { name: "Beef Sour Curry Soup", price: 7.00, discount: 0, stockQty: 15, sku: "CURR-008", prepTime: 20, description: "Spicy sour curry soup", active: true, featured: false, image: "sour-curry.jpg" },
  { name: "Lok Lak Curry Sauce", price: 7.50, discount: 0, stockQty: 15, sku: "CURR-009", prepTime: 15, description: "Lok lak style curry", active: true, featured: false, image: "loklak-curry.jpg" },
  { name: "Pork Curry", price: 6.00, discount: 0, stockQty: 20, sku: "CURR-010", prepTime: 20, description: "Savory pork curry", active: true, featured: false, image: "pork-curry.jpg" },

  // --- 13. Grilled Food ---
  { name: "Grilled Pork", price: 5.50, discount: 0, stockQty: 30, sku: "GRIL-001", prepTime: 15, description: "Marinated grilled pork", active: true, featured: true, image: "grilled-pork.jpg" },
  { name: "Grilled Chicken", price: 5.00, discount: 0, stockQty: 30, sku: "GRIL-002", prepTime: 15, description: "Char-grilled marinated chicken", active: true, featured: true, image: "grilled-chicken.jpg" },
  { name: "Grilled Fish", price: 6.50, discount: 0, stockQty: 20, sku: "GRIL-003", prepTime: 20, description: "Whole grilled fish", active: true, featured: false, image: "grilled-fish.jpg" },
  { name: "Grilled Beef", price: 7.00, discount: 0, stockQty: 20, sku: "GRIL-004", prepTime: 15, description: "Grilled beef skewers", active: true, featured: false, image: "grilled-beef.jpg" },
  { name: "Grilled Squid", price: 8.50, discount: 0, stockQty: 15, sku: "GRIL-005", prepTime: 15, description: "Char-grilled fresh squid", active: true, featured: false, image: "grilled-squid-b.jpg" },
  { name: "Grilled Prawns", price: 8.00, discount: 0, stockQty: 15, sku: "GRIL-006", prepTime: 15, description: "Salted grilled prawns", active: true, featured: false, image: "grilled-prawns-b.jpg" },
  { name: "Grilled Snails", price: 6.00, discount: 0, stockQty: 20, sku: "GRIL-007", prepTime: 15, description: "Grilled snails on open fire", active: true, featured: false, image: "grilled-snails.jpg" },
  { name: "Grilled Sausage", price: 3.00, discount: 0, stockQty: 40, sku: "GRIL-008", prepTime: 10, description: "Grilled pork sausage", active: true, featured: false, image: "grilled-sausage.jpg" },
  { name: "Grilled Chicken Wings", price: 4.50, discount: 0, stockQty: 35, sku: "GRIL-009", prepTime: 15, description: "Honey glazed grilled wings", active: true, featured: true, image: "fried-chicken-wings.jpg" },
  { name: "Meat Skewers", price: 3.50, discount: 0, stockQty: 50, sku: "GRIL-010", prepTime: 10, description: "Various meat skewers", active: true, featured: false, image: "meat-skewers.jpg" },

  // --- 4. Coffee (Additional) --- add new
  { name: "Caramel Macchiato", price: 2.80, discount: 0, stockQty: 30, sku: "COFF-011", prepTime: 4, description: "Espresso with caramel and milk", active: true, featured: false, image: "caramel-macchiato.jpg" },
  { name: "Coconut Coffee", price: 2.50, discount: 0, stockQty: 25, sku: "COFF-012", prepTime: 4, description: "Coffee blended with coconut milk", active: true, featured: true, image: "coconut-coffee.jpg" },
  { name: "Cold Brew Coffee", price: 2.80, discount: 0, stockQty: 20, sku: "COFF-013", prepTime: 5, description: "Slow-steeped smooth coffee", active: true, featured: false, image: "cold-brew.jpg" },

  // --- 5. Matcha (Additional) ---add new
  { name: "Matcha Latte", price: 2.50, discount: 0, stockQty: 35, sku: "MATC-001", prepTime: 3, description: "Premium matcha with creamy milk", active: true, featured: true, image: "matcha-latte.jpg" },
  { name: "Iced Matcha Green Tea", price: 2.20, discount: 0, stockQty: 40, sku: "MATC-002", prepTime: 3, description: "Refreshing pure matcha tea", active: true, featured: true, image: "iced-matcha.jpg" },
  { name: "Matcha Frappe", price: 3.20, discount: 0, stockQty: 25, sku: "MATC-003", prepTime: 4, description: "Blended matcha with whipped cream", active: true, featured: false, image: "matcha-frappe.jpg" }
];
