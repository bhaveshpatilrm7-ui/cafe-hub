const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Table = require('./models/Table');
const Coupon = require('./models/Coupon');
const Inventory = require('./models/Inventory');

const seedData = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cafehub');

    console.log('[Seed]: Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Table.deleteMany();
    await Coupon.deleteMany();
    await Inventory.deleteMany();

    console.log('[Seed]: Creating Users...');
    const adminUser = await User.create({
      name: 'Café Admin',
      email: 'admin@cafehub.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin'
    });

    const staffUser = await User.create({
      name: 'Kitchen Staff Alex',
      email: 'staff@cafehub.com',
      phone: '9876543211',
      password: 'staff123',
      role: 'staff'
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'customer@cafehub.com',
      phone: '9876543212',
      password: 'customer123',
      role: 'customer'
    });

    console.log('[Seed]: Creating Categories...');
    const categoriesData = [
      {
        name: 'Coffee',
        description: 'Rich freshly brewed hot coffees crafted by expert baristas',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1
      },
      {
        name: 'Cold Coffee',
        description: 'Chilled signature frappes, iced lattes and cold brews',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        sortOrder: 2
      },
      {
        name: 'Tea',
        description: 'Aromatic herbal teas, masala chai and green tea blends',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        sortOrder: 3
      },
      {
        name: 'Pizza',
        description: 'Artisanal thin crust sourdough pizzas with premium cheese',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        sortOrder: 4
      },
      {
        name: 'Burgers',
        description: 'Juicy handcrafted gourmet burgers served with crisp fries',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        sortOrder: 5
      },
      {
        name: 'Sandwiches',
        description: 'Toasted artisan bread filled with fresh vegetables and cheeses',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        sortOrder: 6
      },
      {
        name: 'Cakes',
        description: 'Decadent slice cakes and fresh pastries baked daily',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        sortOrder: 7
      },
      {
        name: 'Desserts',
        description: 'Sweet indulgences, sundaes, brownies and waffles',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        sortOrder: 8
      },
      {
        name: 'Snacks',
        description: 'Crispy finger foods, garlic bread, fries and nachos',
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
        sortOrder: 9
      },
      {
        name: 'Beverages',
        description: 'Refreshing fruit coolers, smoothies and mocktails',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        sortOrder: 10
      }
    ];

    const categories = await Category.create(categoriesData);
    const catMap = {};
    categories.forEach(c => (catMap[c.name] = c._id));

    console.log('[Seed]: Creating Products...');
    const productsData = [
      // Coffee
      {
        name: 'Classic Espresso',
        category: catMap['Coffee'],
        description: 'Strong, pure shot of dark roasted Arabica coffee beans extracted under high pressure.',
        basePrice: 120,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.8,
        numReviews: 24,
        options: {
          sizes: [{ name: 'Single Shot', price: 0 }, { name: 'Double Shot', price: 40 }],
          sugarLevels: ['None', 'Less', 'Normal', 'Extra'],
          addOns: [{ name: 'Extra Shot', price: 30 }]
        },
        stockQuantity: 150
      },
      {
        name: 'Café Cappuccino',
        category: catMap['Coffee'],
        description: 'Classic equal parts espresso, steamed milk, and silky velvety milk foam sprinkled with cocoa.',
        basePrice: 160,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.9,
        numReviews: 45,
        options: {
          sizes: [{ name: 'Small', price: 0 }, { name: 'Medium', price: 30 }, { name: 'Large', price: 50 }],
          sugarLevels: ['None', 'Less', 'Normal', 'Extra'],
          addOns: [{ name: 'Whipped Cream', price: 25 }, { name: 'Hazelnut Syrup', price: 30 }]
        },
        stockQuantity: 120
      },
      {
        name: 'Caffè Latte',
        category: catMap['Coffee'],
        description: 'Smooth espresso balanced with rich steamed milk and a delicate layer of micro-foam.',
        basePrice: 170,
        discountPercent: 5,
        image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.7,
        numReviews: 19,
        options: {
          sizes: [{ name: 'Medium', price: 0 }, { name: 'Large', price: 40 }],
          sugarLevels: ['None', 'Less', 'Normal', 'Extra'],
          addOns: [{ name: 'Vanilla Syrup', price: 30 }, { name: 'Oat Milk', price: 35 }]
        },
        stockQuantity: 100
      },
      {
        name: 'Caramel Macchiato',
        category: catMap['Coffee'],
        description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and drizzled with caramel.',
        basePrice: 190,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.9,
        numReviews: 52,
        options: {
          sizes: [{ name: 'Medium', price: 0 }, { name: 'Large', price: 40 }],
          sugarLevels: ['Less', 'Normal', 'Extra'],
          addOns: [{ name: 'Extra Caramel Drizzle', price: 25 }]
        },
        stockQuantity: 80
      },

      // Cold Coffee
      {
        name: 'Iced Caramel Frappe',
        category: catMap['Cold Coffee'],
        description: 'Blended cold espresso with ice, milk, caramel syrup and topped with whipped cream.',
        basePrice: 210,
        discountPercent: 15,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.9,
        numReviews: 61,
        options: {
          sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 40 }],
          sugarLevels: ['Less', 'Normal', 'Extra'],
          addOns: [{ name: 'Ice Cream Scoop', price: 35 }, { name: 'Extra Whipped Cream', price: 25 }]
        },
        stockQuantity: 90
      },
      {
        name: 'Signature Cold Brew',
        category: catMap['Cold Coffee'],
        description: 'Steeped for 20 hours in cold water, delivering an ultra-smooth, naturally sweet coffee.',
        basePrice: 180,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.6,
        numReviews: 15,
        options: {
          sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 30 }],
          sugarLevels: ['None', 'Less', 'Normal'],
          addOns: [{ name: 'Sweet Cream Foam', price: 30 }]
        },
        stockQuantity: 60
      },

      // Tea
      {
        name: 'Royal Masala Chai',
        category: catMap['Tea'],
        description: 'Traditional Indian black tea infused with ginger, cardamom, cinnamon and cloves with milk.',
        basePrice: 90,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.8,
        numReviews: 33,
        options: {
          sizes: [{ name: 'Kulhad', price: 0 }, { name: 'Large Mug', price: 20 }],
          sugarLevels: ['None', 'Less', 'Normal', 'Extra']
        },
        stockQuantity: 200
      },
      {
        name: 'Jasmine Green Tea',
        category: catMap['Tea'],
        description: 'Delicate green tea leaves scented with fragrant sweet jasmine blossoms.',
        basePrice: 110,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.5,
        numReviews: 12,
        options: {
          sizes: [{ name: 'Pot for One', price: 0 }],
          sugarLevels: ['None', 'Honey']
        },
        stockQuantity: 80
      },

      // Pizza
      {
        name: 'Margherita Supreme Pizza',
        category: catMap['Pizza'],
        description: 'Sourdough base, San Marzano tomato sauce, fresh mozzarella cheese and organic basil leaves.',
        basePrice: 320,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.9,
        numReviews: 78,
        options: {
          sizes: [{ name: '8 Inch Personal', price: 0 }, { name: '12 Inch Medium', price: 150 }],
          addOns: [{ name: 'Extra Cheese Burst', price: 60 }, { name: 'Jalapeños', price: 25 }]
        },
        stockQuantity: 40
      },
      {
        name: 'Paneer Tikka Passion Pizza',
        category: catMap['Pizza'],
        description: 'Spicy marinated cottage cheese cubes, capsicum, red onions and mint cilantro mayo.',
        basePrice: 380,
        discountPercent: 5,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.8,
        numReviews: 44,
        options: {
          sizes: [{ name: '8 Inch Personal', price: 0 }, { name: '12 Inch Medium', price: 160 }],
          addOns: [{ name: 'Extra Cheese Burst', price: 60 }]
        },
        stockQuantity: 35
      },

      // Burgers
      {
        name: 'Classic Veggie Cheese Burger',
        category: catMap['Burgers'],
        description: 'Crispy herb potato patty, cheddar slice, lettuce, tomatoes, and house bistro burger sauce in brioche bun.',
        basePrice: 190,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.7,
        numReviews: 39,
        options: {
          sizes: [{ name: 'Single Patty', price: 0 }, { name: 'Double Patty', price: 50 }],
          addOns: [{ name: 'French Fries Side', price: 50 }, { name: 'Extra Cheese', price: 30 }]
        },
        stockQuantity: 50
      },
      {
        name: 'Smokey BBQ Mushroom Burger',
        category: catMap['Burgers'],
        description: 'Sautéed mushrooms, caramelized onions, smoked BBQ glaze, and melted Swiss cheese.',
        basePrice: 240,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.6,
        numReviews: 21,
        options: {
          addOns: [{ name: 'Peri Peri Seasoned Fries', price: 60 }]
        },
        stockQuantity: 30
      },

      // Sandwiches
      {
        name: 'Paneer Club Grilled Sandwich',
        category: catMap['Sandwiches'],
        description: 'Three-tiered multi-grain bread stuffed with spiced paneer, coleslaw, cucumber, tomato and green chutney.',
        basePrice: 180,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.7,
        numReviews: 31,
        options: {
          sizes: [{ name: 'Regular', price: 0 }],
          addOns: [{ name: 'Extra Cheese Toast', price: 30 }]
        },
        stockQuantity: 45
      },
      {
        name: 'Cheese Garlic Toasties',
        category: catMap['Sandwiches'],
        description: 'Crispy sourdough bread slathered with garlic butter and melted mozzarella & cheddar blend.',
        basePrice: 140,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.8,
        numReviews: 29,
        stockQuantity: 60
      },

      // Cakes
      {
        name: 'Belgian Chocolate Truffle Cake Slice',
        category: catMap['Cakes'],
        description: 'Rich dark chocolate sponge layered with dense Belgian chocolate ganache.',
        basePrice: 160,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.9,
        numReviews: 88,
        options: {
          sizes: [{ name: 'Single Slice', price: 0 }, { name: 'Double Slice', price: 140 }]
        },
        stockQuantity: 25
      },
      {
        name: 'Red Velvet Cream Cheese Slice',
        category: catMap['Cakes'],
        description: 'Vibrant cocoa-infused red sponge cake with luscious vanilla cream cheese frosting.',
        basePrice: 170,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.8,
        numReviews: 34,
        stockQuantity: 20
      },

      // Desserts
      {
        name: 'Sizzling Walnut Brownie with Ice Cream',
        category: catMap['Desserts'],
        description: 'Warm fudgy walnut brownie served on a hot skillet topped with cold vanilla ice cream and hot chocolate fudge.',
        basePrice: 220,
        discountPercent: 15,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 5.0,
        numReviews: 104,
        options: {
          addOns: [{ name: 'Extra Ice Cream Scoop', price: 40 }]
        },
        stockQuantity: 40
      },
      {
        name: 'Nutella Loaded Waffle',
        category: catMap['Desserts'],
        description: 'Golden Belgian waffle smothered with original Nutella, sliced banana and toasted almonds.',
        basePrice: 230,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.8,
        numReviews: 42,
        stockQuantity: 30
      },

      // Snacks
      {
        name: 'Loaded Cheese Fries',
        category: catMap['Snacks'],
        description: 'Golden crispy fries drenched in hot liquid cheddar cheese sauce, jalapeños and chopped scallions.',
        basePrice: 150,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.7,
        numReviews: 55,
        options: {
          sizes: [{ name: 'Regular', price: 0 }, { name: 'Jumbo Basket', price: 60 }],
          addOns: [{ name: 'Peri Peri Dust', price: 15 }]
        },
        stockQuantity: 70
      },
      {
        name: 'Crispy Corn & Cheese Balls',
        category: catMap['Snacks'],
        description: 'Golden fried sweetcorn and mozzarella cheese balls served with spicy chipotle dip.',
        basePrice: 170,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.6,
        numReviews: 23,
        stockQuantity: 50
      },

      // Beverages
      {
        name: 'Fresh Mint Mojito',
        category: catMap['Beverages'],
        description: 'Zesty lime juice, crushed fresh mint leaves, cane sugar and sparkling soda on rocks.',
        basePrice: 140,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        isFeatured: false,
        rating: 4.7,
        numReviews: 38,
        stockQuantity: 100
      },
      {
        name: 'Mango Passion Fruit Cooler',
        category: catMap['Beverages'],
        description: 'Tropical blend of ripe Alphonso mango puree and exotic passion fruit over crushed ice.',
        basePrice: 160,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80',
        isFeatured: true,
        rating: 4.9,
        numReviews: 47,
        stockQuantity: 80
      }
    ];

    await Product.create(productsData);

    console.log('[Seed]: Creating Tables...');
    const tablesData = [
      { tableNumber: 'T-01', capacity: 2, location: 'Indoor', status: 'Available' },
      { tableNumber: 'T-02', capacity: 2, location: 'Window View', status: 'Available' },
      { tableNumber: 'T-03', capacity: 4, location: 'Indoor', status: 'Available' },
      { tableNumber: 'T-04', capacity: 4, location: 'Terrace', status: 'Available' },
      { tableNumber: 'T-05', capacity: 6, location: 'Private Booth', status: 'Available' },
      { tableNumber: 'T-06', capacity: 8, location: 'Terrace', status: 'Available' }
    ];
    await Table.create(tablesData);

    console.log('[Seed]: Creating Coupons...');
    const couponsData = [
      {
        code: 'CAFE20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'WELCOME50',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 150,
        maxDiscountAmount: 50,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'COFFEE10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 100,
        maxDiscountAmount: 50,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        isActive: true
      }
    ];
    await Coupon.create(couponsData);

    console.log('[Seed]: Creating Inventory items...');
    const inventoryData = [
      { item: 'Arabica Coffee Beans', category: 'Raw Coffee', quantity: 25, unit: 'kg', minThreshold: 5, status: 'In Stock' },
      { item: 'Whole Milk', category: 'Dairy', quantity: 40, unit: 'L', minThreshold: 10, status: 'In Stock' },
      { item: 'Mozzarella Cheese', category: 'Dairy', quantity: 8, unit: 'kg', minThreshold: 3, status: 'In Stock' },
      { item: 'Chocolate Fudge Syrup', category: 'Syrups', quantity: 2, unit: 'kg', minThreshold: 3, status: 'Low Stock' },
      { item: 'Brownie Mix', category: 'Bakery', quantity: 15, unit: 'packs', minThreshold: 5, status: 'In Stock' },
      { item: 'Matcha Powder', category: 'Tea', quantity: 0, unit: 'kg', minThreshold: 1, status: 'Out of Stock' }
    ];
    await Inventory.create(inventoryData);

    console.log('✅ [Seed]: Database seeding complete!');
    console.log('----------------------------------------------------');
    console.log('Credentials Summary:');
    console.log('Admin:    admin@cafehub.com    / admin123');
    console.log('Staff:    staff@cafehub.com    / staff123');
    console.log('Customer: customer@cafehub.com / customer123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(`❌ [Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
