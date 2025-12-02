// Simple script to add test item to cart localStorage for testing checkout
const testCartItem = {
  id: 'test-product-1',
  productId: 'test-product-1', 
  name: 'Test Coffee Bag',
  slug: 'test-coffee-bag',
  price: 25.99,
  quantity: 2,
  image: null,
  maxQuantity: 100
};

const cartData = JSON.stringify([testCartItem]);
console.log('Test cart data to be added:');
console.log(cartData);
console.log('\n');
console.log('To test checkout:');
console.log('1. Open browser console at localhost:3000');
console.log('2. Run: localStorage.setItem("ecommerce-cart", \`' + cartData + '\`)');
console.log('3. Navigate to /checkout');
