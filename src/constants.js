// ─── Hằng số & helpers dùng chung toàn app ───────────────────────────────────

export const TOTAL_TABLES = 20;

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const FILTERS = [
  { key: "ALL",      label: "Tất cả"     },
  { key: "COMBO",    label: "Combo"      },
  { key: "DUMPLING", label: "Dimsum"     },
  { key: "TAPAS",    label: "Tapas"      },
  { key: "SALAD",    label: "Salad"      },
  { key: "SOUP",     label: "Soup"       },
  { key: "SUSHI",    label: "Sushi"      },
  { key: "SASHIMI",  label: "Sashimi"    },
  { key: "RAMEN",    label: "Ramen"      },
  { key: "RICE",     label: "Cơm - Mì"   },
  { key: "DESSERT",  label: "Tráng miệng" },
  { key: "KIDS",     label: "Trẻ em"    },
  { key: "EXTRA",    label: "Thêm"       },
  { key: "DRINK",    label: "Đồ uống"   },
];

// ─── Format tiền VND ─────────────────────────────────────────────────────────
export const formatMoney = (n) =>
  new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";

// ─── Bỏ dấu tiếng Việt để so sánh ───────────────────────────────────────────
export const removeTones = (str) => {
  const map = {
    à:"a",á:"a",ả:"a",ã:"a",ạ:"a",ă:"a",ắ:"a",ằ:"a",ẳ:"a",ẵ:"a",ặ:"a",
    â:"a",ấ:"a",ầ:"a",ẩ:"a",ẫ:"a",ậ:"a",đ:"d",
    è:"e",é:"e",ẻ:"e",ẽ:"e",ẹ:"e",ê:"e",ế:"e",ề:"e",ể:"e",ễ:"e",ệ:"e",
    ì:"i",í:"i",ỉ:"i",ĩ:"i",ị:"i",
    ò:"o",ó:"o",ỏ:"o",õ:"o",ọ:"o",ô:"o",ố:"o",ồ:"o",ổ:"o",ỗ:"o",ộ:"o",
    ơ:"o",ớ:"o",ờ:"o",ở:"o",ỡ:"o",ợ:"o",
    ù:"u",ú:"u",ủ:"u",ũ:"u",ụ:"u",ư:"u",ứ:"u",ừ:"u",ử:"u",ữ:"u",ự:"u",
    ỳ:"y",ý:"y",ỷ:"y",ỹ:"y",ỵ:"y",
  };
  return str.toLowerCase().split("").map((c) => map[c] || c).join("");
};

// ─── Lọc menu theo danh mục ──────────────────────────────────────────────────
export const filterMenu = (menu, filter) => {
  if (filter === "ALL") return menu;
  const r   = (m) => removeTones(m.name).toLowerCase();
  const has = (m, ...keys) => keys.some((k) => r(m).includes(removeTones(k).toLowerCase()));
  const map = {
    COMBO:    (m) => m.type === "COMBO",
    DRINK:    (m) => m.type === "DRINK",
    DUMPLING: (m) => has(m, "gyoza","dumpling","ha cao","bao bun","wonton"),
    TAPAS:    (m) => has(m, "prawn","rolls","stick","edamame","chicken","avocado","veggie rolls","panko","summer","sommerrolle","ha noi"),
    SALAD:    (m) => has(m, "salat","salad","seetang","gurken","wakame","mango salat"),
    SOUP:     (m) => has(m, "ramen","soup","tom yum") && !has(m,"miso ramen","tonkotsu","spicy ramen"),
    SUSHI:    (m) => has(m, "roll","nigiri","maki") && !has(m,"sashimi"),
    SASHIMI:  (m) => has(m, "sashimi","tataki","tatar"),
    RAMEN:    (m) => has(m, "ramen"),
    RICE:     (m) => has(m, "fried rice","pad thai","udon","nudeln"),
    DESSERT:  (m) => has(m, "mochi","banana","tiramisu","souffle","pagoda","affogato","eis"),
    KIDS:     (m) => has(m, "kids","kid","snack for kids","happy kids","popcorn"),
    EXTRA:    (m) => has(m, "extra","sauce"),
  };
  const fn = map[filter];
  return fn ? menu.filter(fn) : menu;
};
// ─── Tính tổng tiền / tổng số lượng ─────────────────────────────────────────
export const calcTotal    = (td = {}) => Object.values(td).reduce((s,i) => s + i.price * i.qty, 0);
export const calcTotalQty = (td = {}) => Object.values(td).reduce((s,i) => s + i.qty, 0);