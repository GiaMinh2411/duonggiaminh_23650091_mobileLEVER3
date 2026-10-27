import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";

const STORAGE_KEY = "shopping-cart-level3";

function loadCart() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return undefined;

        const data = JSON.parse(saved);

        if (!data || !Array.isArray(data.items)) {
            return undefined;
        }

        const validItems = data.items.every(
            (item) =>
            item &&
            (typeof item.id === "number" ||
                typeof item.id === "string") &&
            typeof item.name === "string" &&
            Number.isFinite(item.price) &&
            item.price > 0 &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0
        );

        if (!validItems) return undefined;

        return {
            items: data.items,
            discountCode: ["SUMMER10", "SPECIAL20"].includes(
                    data.discountCode
                ) ?
                data.discountCode :
                "",
            taxRate: 0.1,
            shippingCost: [0, 10000, 25000].includes(
                    data.shippingCost
                ) ?
                data.shippingCost :
                10000,
        };
    } catch {
        return undefined;
    }
}

const savedCart = loadCart();

export const store = configureStore({
    reducer: {
        products: productsReducer,
        cart: cartReducer,
    },

    preloadedState: savedCart ?
        { cart: savedCart } :
        undefined,
});

let previousCart = store.getState().cart;

store.subscribe(() => {
    const cart = store.getState().cart;

    if (cart === previousCart) return;

    previousCart = cart;

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );
    } catch {
        console.warn("Không thể lưu giỏ hàng.");
    }
});