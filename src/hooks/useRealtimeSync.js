// ─── useRealtimeSync — WebSocket realtime sync giữa các thiết bị POS ──────────
import { useEffect, useRef } from "react";
import { API_URL } from "../constants";

/**
 * Kết nối WebSocket /pos và lắng nghe các sự kiện:
 *   TABLE_STATUS  → cập nhật màu bàn realtime
 *   BILL_PAID     → xoá order bàn vừa thanh toán trên tất cả thiết bị
 */
export function useRealtimeSync({
  getToken,
  setTableStatus,
  setTableOrders,
  setKitchenSent,
  setItemNotes,
}) {
  const wsRef      = useRef(null);
  const retryRef   = useRef(null);
  const retryDelay = useRef(2000);

  const connect = () => {
    const token = getToken();
    if (!token) return;

    // Chuyển http(s) → ws(s)
    const wsUrl = API_URL.replace(/^http/, "ws") + `/pos?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ POS WebSocket connected");
      retryDelay.current = 2000; // reset delay khi kết nối thành công
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.event === "TABLE_STATUS") {
          // Cập nhật trạng thái 1 bàn ngay lập tức
          setTableStatus(prev => ({ ...prev, [msg.table_num]: msg.status }));
        }

        if (msg.event === "BILL_PAID") {
          // Bàn đã thanh toán → clear order + cập nhật status
          setTableStatus(prev => ({ ...prev, [msg.table_num]: "PAYING" }));
          setTableOrders(prev => {
            const next = { ...prev };
            delete next[msg.table_num];
            return next;
          });
          setKitchenSent(prev => {
            const next = { ...prev };
            delete next[msg.table_num];
            return next;
          });
          setItemNotes(prev => {
            const next = { ...prev };
            delete next[msg.table_num];
            return next;
          });
        }
      } catch {}
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      console.warn(`⚠️ POS WebSocket closed. Retry in ${retryDelay.current}ms`);
      // Tự reconnect với exponential backoff (tối đa 30s)
      retryRef.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 1.5, 30000);
        connect();
      }, retryDelay.current);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      if (wsRef.current) wsRef.current.onclose = null; // tắt auto-reconnect khi unmount
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line
}