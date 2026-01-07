import { createClient } from '@/lib/supabase/client';

export interface GroceryItem {
    id: string;
    name: string;
    category: string;
    estimatedPrice: number;
    quantity: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    lastPurchased?: string;
    store?: string;
}

export interface GroceryList {
    id: string;
    items: GroceryItem[];
    totalEstimate: number;
    createdAt: string;
    status: 'draft' | 'ready' | 'ordered';
}

// Category mappings for grocery detection
const groceryCategories: Record<string, string[]> = {
    'Produce': ['fruit', 'vegetable', 'apple', 'banana', 'lettuce', 'tomato', 'organic'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
    'Meat': ['beef', 'chicken', 'pork', 'turkey', 'salmon', 'fish', 'meat'],
    'Bakery': ['bread', 'bagel', 'muffin', 'cake', 'pastry'],
    'Pantry': ['rice', 'pasta', 'cereal', 'canned', 'beans', 'sauce'],
    'Frozen': ['frozen', 'ice cream', 'pizza'],
    'Beverages': ['juice', 'soda', 'water', 'coffee', 'tea'],
    'Household': ['paper towel', 'toilet paper', 'soap', 'detergent'],
    'Personal Care': ['shampoo', 'toothpaste', 'deodorant'],
};

// Analyze transactions to detect grocery patterns
export async function analyzeGroceryPatterns(userId: string): Promise<{
    frequentItems: GroceryItem[];
    suggestedList: GroceryItem[];
    weeklyAverage: number;
    monthlyAverage: number;
}> {
    const supabase = createClient();

    // Get last 3 months of grocery transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .or('category.ilike.%grocery%,merchant_name.ilike.%walmart%,merchant_name.ilike.%kroger%,merchant_name.ilike.%whole foods%,merchant_name.ilike.%publix%,merchant_name.ilike.%target%')
        .order('date', { ascending: false });

    const groceryTransactions = transactions || [];

    // Calculate averages
    const totalSpent = groceryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const weeklyAverage = totalSpent / 12; // ~12 weeks in 3 months
    const monthlyAverage = totalSpent / 3;

    // Detect frequent items based on patterns (simplified - in production would use ML)
    const frequentItems: GroceryItem[] = [
        { id: '1', name: 'Milk (1 gallon)', category: 'Dairy', estimatedPrice: 4.99, quantity: 1, frequency: 'weekly' },
        { id: '2', name: 'Bread', category: 'Bakery', estimatedPrice: 3.49, quantity: 1, frequency: 'weekly' },
        { id: '3', name: 'Eggs (dozen)', category: 'Dairy', estimatedPrice: 4.99, quantity: 1, frequency: 'weekly' },
        { id: '4', name: 'Bananas', category: 'Produce', estimatedPrice: 1.99, quantity: 1, frequency: 'weekly' },
        { id: '5', name: 'Chicken Breast', category: 'Meat', estimatedPrice: 8.99, quantity: 2, frequency: 'weekly' },
    ];

    // Generate suggested list based on patterns
    const suggestedList: GroceryItem[] = [
        ...frequentItems,
        { id: '6', name: 'Cereal', category: 'Pantry', estimatedPrice: 4.29, quantity: 1, frequency: 'biweekly' },
        { id: '7', name: 'Rice (2lb)', category: 'Pantry', estimatedPrice: 3.99, quantity: 1, frequency: 'monthly' },
        { id: '8', name: 'Paper Towels', category: 'Household', estimatedPrice: 12.99, quantity: 1, frequency: 'monthly' },
    ];

    return {
        frequentItems,
        suggestedList,
        weeklyAverage,
        monthlyAverage,
    };
}

// Generate a new grocery list
export async function generateGroceryList(userId: string): Promise<GroceryList> {
    const analysis = await analyzeGroceryPatterns(userId);

    const list: GroceryList = {
        id: `list-${Date.now()}`,
        items: analysis.suggestedList,
        totalEstimate: analysis.suggestedList.reduce(
            (sum, item) => sum + item.estimatedPrice * item.quantity,
            0
        ),
        createdAt: new Date().toISOString(),
        status: 'draft',
    };

    return list;
}

// Price comparison across stores
export interface StorePricing {
    store: string;
    logoUrl: string;
    totalPrice: number;
    savings: number;
    deliveryFee: number;
    estimatedDelivery: string;
}

export async function comparePrices(items: GroceryItem[]): Promise<StorePricing[]> {
    // In production, would call actual store APIs (Instacart, Walmart, etc.)
    const basePrice = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);

    return [
        {
            store: 'Walmart',
            logoUrl: '/stores/walmart.png',
            totalPrice: basePrice * 0.92,
            savings: basePrice * 0.08,
            deliveryFee: 0,
            estimatedDelivery: 'Today, 2-4 PM',
        },
        {
            store: 'Instacart (Kroger)',
            logoUrl: '/stores/instacart.png',
            totalPrice: basePrice * 0.95,
            savings: basePrice * 0.05,
            deliveryFee: 3.99,
            estimatedDelivery: 'Today, 1-3 PM',
        },
        {
            store: 'Amazon Fresh',
            logoUrl: '/stores/amazon.png',
            totalPrice: basePrice * 0.98,
            savings: basePrice * 0.02,
            deliveryFee: 0,
            estimatedDelivery: 'Tomorrow, 8 AM',
        },
        {
            store: 'Target',
            logoUrl: '/stores/target.png',
            totalPrice: basePrice * 1.02,
            savings: 0,
            deliveryFee: 4.99,
            estimatedDelivery: 'Today, 3-5 PM',
        },
    ];
}

// Place order (would integrate with store APIs)
export async function placeGroceryOrder(
    list: GroceryList,
    store: string
): Promise<{
    success: boolean;
    orderId?: string;
    estimatedDelivery?: string;
    error?: string;
}> {
    // In production, would use Instacart/Walmart/Amazon APIs
    console.log(`Placing order at ${store} for ${list.items.length} items`);

    // Simulate order placement
    return {
        success: true,
        orderId: `ORD-${Date.now()}`,
        estimatedDelivery: 'Today, 2-4 PM',
    };
}
