import {
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",

    initialState: {
        items: [],
        discountCode: "",
        taxRate: 0.1,
        shippingCost: 10000,
    },

    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(
                (item) => item.id === action.payload.id
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({
                    ...action.payload,
                    quantity: 1,
                });
            }
        },

        increaseQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload
            );

            if (item) {
                item.quantity += 1;
            }
        },

        decreaseQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload
            );

            if (item && item.quantity > 1) {
                item.quantity -= 1;
            }
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },

        clearCart: (state) => {
            state.items = [];
            state.discountCode = "";
        },

        applyDiscount: (state, action) => {
            state.discountCode = action.payload;
        },

        setShippingCost: (state, action) => {
            state.shippingCost = action.payload;
        },
    },
});

export const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    setShippingCost,
} = cartSlice.actions;

export default cartSlice.reducer;

// Tính hóa đơn bằng selector có memoization.
export const selectCartSummary = createSelector(
    [(state) => state.cart],
    (cart) => {
        const subtotal = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const itemCount = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        let discountRate = 0;

        if (cart.discountCode === "SUMMER10") {
            discountRate = 0.1;
        } else if (cart.discountCode === "SPECIAL20") {
            discountRate = 0.2;
        }

        const discount = Math.round(subtotal * discountRate);

        // Theo công thức trong file: thuế trên tiền hàng.
        const tax = Math.round(subtotal * cart.taxRate);

        // Giỏ trống không tính vận chuyển.
        const shipping = itemCount > 0 ? cart.shippingCost : 0;

        return {
            subtotal,
            itemCount,
            discount,
            tax,
            shipping,
            total: subtotal - discount + tax + shipping,
        };
    }
);