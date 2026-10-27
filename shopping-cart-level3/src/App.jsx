import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "./slices/productsSlice";

import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
  selectCartSummary,
} from "./slices/cartSlice";

function money(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.products.items
  );

  const status = useSelector(
    (state) => state.products.status
  );

  const error = useSelector(
    (state) => state.products.error
  );

  const cart = useSelector((state) => state.cart);
  const summary = useSelector(selectCartSummary);

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  function handleApplyDiscount(event) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();

    if (
      normalizedCode !== "SUMMER10" &&
      normalizedCode !== "SPECIAL20"
    ) {
      setMessage(
        "Mã không hợp lệ. Hãy nhập SUMMER10 hoặc SPECIAL20."
      );
      return;
    }

    dispatch(applyDiscount(normalizedCode));
    setMessage(`Đã áp dụng mã ${normalizedCode}.`);
  }

  function handleClearCart() {
    dispatch(clearCart());
    setCode("");
    setMessage("Đã xóa toàn bộ giỏ hàng.");
  }

  return (
    <main>
      <header>
        <h1>Giỏ hàng Level 3</h1>
        <p>Redux Toolkit • Async Thunk • LocalStorage</p>
      </header>

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      <section>
        <div className="section-heading">
          <h2>Danh sách sản phẩm</h2>

          <button
            disabled={status === "loading"}
            onClick={() => dispatch(fetchProducts())}
          >
            Tải lại API
          </button>
        </div>

        {status === "loading" && (
          <p>Đang tải sản phẩm từ API...</p>
        )}

        {status === "failed" && (
          <p className="error" role="alert">
            {error}. Kiểm tra JSON Server tại cổng 3001
            rồi bấm Tải lại API.
          </p>
        )}

        {status === "succeeded" &&
          products.length === 0 && (
            <p>Chưa có sản phẩm.</p>
          )}

        <div className="products">
          {products.map((product) => (
            <article key={product.id}>
              <h3>{product.name}</h3>
              <p className="price">
                {money(product.price)}
              </p>

              <button
                onClick={() => {
                  dispatch(addToCart(product));
                  setMessage(
                    `Đã thêm ${product.name} vào giỏ.`
                  );
                }}
              >
                Thêm vào giỏ
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>
            Giỏ hàng — {summary.itemCount} sản phẩm
          </h2>

          <button
            className="danger"
            disabled={cart.items.length === 0}
            onClick={handleClearCart}
          >
            Xóa toàn bộ
          </button>
        </div>

        {cart.items.length === 0 ? (
          <p>Giỏ hàng đang trống.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{money(item.price)}</td>

                    <td>
                      <div className="quantity">
                        <button
                          aria-label={`Giảm ${item.name}`}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            dispatch(
                              decreaseQuantity(item.id)
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          aria-label={`Tăng ${item.name}`}
                          onClick={() =>
                            dispatch(
                              increaseQuantity(item.id)
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>
                      {money(
                        item.price * item.quantity
                      )}
                    </td>

                    <td>
                      <button
                        className="danger"
                        onClick={() =>
                          dispatch(
                            removeFromCart(item.id)
                          )
                        }
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="checkout-layout">
        <section>
          <h2>Ưu đãi và vận chuyển</h2>

          <p>
            SUMMER10: giảm 10% · SPECIAL20: giảm 20%
          </p>

          <form
            onSubmit={handleApplyDiscount}
            className="discount-form"
          >
            <input
              aria-label="Mã giảm giá"
              placeholder="Nhập mã giảm giá"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
            />

            <button type="submit">Áp dụng</button>
          </form>

          <p>
            Mã đang dùng:{" "}
            <strong>
              {cart.discountCode || "Chưa có"}
            </strong>
          </p>

          <button
            className="secondary"
            onClick={() => {
              dispatch(applyDiscount(""));
              setCode("");
              setMessage("Đã bỏ mã giảm giá.");
            }}
          >
            Bỏ mã giảm giá
          </button>

          <h3>Phương thức vận chuyển</h3>

          <select
            aria-label="Phương thức vận chuyển"
            value={cart.shippingCost}
            onChange={(event) =>
              dispatch(
                setShippingCost(
                  Number(event.target.value)
                )
              )
            }
          >
            <option value={0}>Miễn phí</option>
            <option value={10000}>
              Tiêu chuẩn — 10.000đ
            </option>
            <option value={25000}>
              Giao nhanh — 25.000đ
            </option>
          </select>
        </section>

        <section>
          <h2>Tóm tắt đơn hàng</h2>

          <div className="summary-row">
            <span>Tiền hàng</span>
            <strong>{money(summary.subtotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Giảm giá</span>
            <strong>−{money(summary.discount)}</strong>
          </div>

          <div className="summary-row">
            <span>Thuế 10%</span>
            <strong>{money(summary.tax)}</strong>
          </div>

          <div className="summary-row">
            <span>Vận chuyển</span>
            <strong>{money(summary.shipping)}</strong>
          </div>

          <div className="summary-row total">
            <span>Thành tiền</span>
            <strong>{money(summary.total)}</strong>
          </div>
        </section>
      </div>
    </main>
  );
}