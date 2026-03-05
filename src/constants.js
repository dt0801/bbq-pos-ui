// ─── Hằng số & helpers dùng chung toàn app ───────────────────────────────────

export const TOTAL_TABLES = 20;

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const FILTERS = [
  { key: "ALL",     label: "Tất cả"   },
  { key: "COMBO",   label: "Combo"    },
  { key: "KHAI_VI", label: "Khai vị"  },
  { key: "SIGNATURE",label:"Signature"},
  { key: "NHAU",    label: "Nhậu"     },
  { key: "GA",      label: "Gà"       },
  { key: "BO",      label: "Bò"       },
  { key: "HEO",     label: "Heo/Nai"  },
  { key: "ECH",     label: "Ếch"      },
  { key: "CA",      label: "Cá"       },
  { key: "LUON",    label: "Lươn"     },
  { key: "SO_DIEP", label: "Sò điệp"  },
  { key: "HAISAN",  label: "Hải sản"  },
  { key: "RAU",     label: "Rau xào"  },
  { key: "LAU",     label: "Lẩu"      },
  { key: "COM_MI",  label: "Cơm - Mì" },
  { key: "DRINK",   label: "Đồ uống"  },
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
  const r   = (m) => removeTones(m.name);
  const has = (m, ...keys) => keys.some((k) => r(m).includes(removeTones(k)));
  const not = (m, ...keys) => !keys.some((k) => r(m).includes(removeTones(k)));
  const map = {
    COMBO:    (m) => m.type === "COMBO",
    DRINK:    (m) => m.type === "DRINK",
    KHAI_VI:  (m) => has(m, "xuc xich","khoai tay","salad"),
    SIGNATURE:(m) => has(m, "oc nhoi","heo moi","nai xao","nai xong","dat vang","tieu xanh"),
    NHAU:     (m) => has(m, "sun ga chien","chan ga chien","canh ga chien","ech chien gion","ca trung chien"),
    GA:       (m) => has(m, "ga")  && not(m, "chien man","sun ga","ca trum","ra lau"),
    BO:       (m) => has(m, "bo")  && not(m, "bun bo","ra bo"),
    HEO:      (m) => has(m, "heo","nai","suon heo"),
    ECH:      (m) => has(m, "ech"),
    CA:       (m) => has(m, "ca trung nuong","ca tam nuong"),
    LUON:     (m) => has(m, "luon ngong"),
    SO_DIEP:  (m) => has(m, "so diep"),
    HAISAN:   (m) => has(m, "tom","muc","bach tuoc"),
    RAU:      (m) => has(m, "rau muong","rau cu xao","rau rung","mang tay xao"),
    LAU:      (m) => has(m, "lau","dia lau","nam kim cham","mi goi","rau lau") && not(m,"ca tau mang"),
    COM_MI:   (m) => has(m, "com chien","mi xao","com lam"),
  };
  const fn = map[filter];
  return fn ? menu.filter(fn) : menu;
};

// ─── Tính tổng tiền / tổng số lượng ─────────────────────────────────────────
export const calcTotal    = (td = {}) => Object.values(td).reduce((s,i) => s + i.price * i.qty, 0);
export const calcTotalQty = (td = {}) => Object.values(td).reduce((s,i) => s + i.qty, 0);