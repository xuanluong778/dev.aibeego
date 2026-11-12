# DATA-CATALOG: dữ liệu giả và dữ liệu hệ thống nhận vào

Tài liệu này trả lời hai câu hỏi: **bộ test tự tạo những dữ liệu giả nào**, và **bộ test đưa gì vào hệ thống rồi nhận lại gì**.

## A. Cách đọc nhật ký khi chạy test

Mỗi case in ra các dòng có nhãn (tắt bằng `LP_TRACE=0`; ghi thêm ra tệp JSON Lines bằng `LP_TRACE_FILE=/đường/dẫn/trace.jsonl`):

| Nhãn | Ý nghĩa |
|---|---|
| `[FAKE]` | Dữ liệu giả do bộ test tự tạo (lấy từ thư mục `fixtures/`) |
| `[SYSTEM]` | Dữ liệu bộ test **đưa vào hệ thống**: tham số hàm, hoặc yêu cầu HTTP (phương thức, đường dẫn, header, body). Mật khẩu, token, header Authorization được thay bằng `***` |
| `[ACTUAL]` | Kết quả **thực tế hệ thống trả về** (mã HTTP, body, giá trị hàm) |
| `[EXPECT]` | Giá trị mong đợi, chỉ in khi test so sánh với một giá trị cụ thể |

## B. Dữ liệu giả (fixtures)

Nguồn: thư mục `fixtures/`. Bản in đầy đủ luôn cập nhật được bằng lệnh:

```bash
cd packages/database && npx tsx ../../tests/landing-page/tools/show-data.ts
```

Bản in dưới đây lấy từ lần chạy lệnh trên (các giá trị ngẫu nhiên như `RUN_ID`, IP, số điện thoại sẽ khác ở mỗi lần chạy).


### RUN_ID và cách đặt tên dữ liệu tạo ra trong mỗi lần chạy

```json
{
  "RUN_ID": "LPT-20261111-kip0",
  "uniq": "LPT trang LPT-20261111-kip0-1",
  "uniqSlug": "lpt-slug-lpt-20261111-kip0-2"
}
```

### Tài khoản (mật khẩu lấy từ biến môi trường, không có trong mã)

```json
{
  "ORG_A_OWNER": {
    "role": "Chủ tổ chức A",
    "permissions": [
      "lead.read",
      "lead.write"
    ],
    "env": "LP_ORG_A_OWNER_EMAIL / LP_ORG_A_OWNER_PASSWORD"
  },
  "ORG_A_VIEWER": {
    "role": "Thành viên A chỉ xem",
    "permissions": [
      "lead.read"
    ],
    "env": "LP_ORG_A_VIEWER_EMAIL / LP_ORG_A_VIEWER_PASSWORD"
  },
  "ORG_B_OWNER": {
    "role": "Chủ tổ chức B (kiểm tra tách dữ liệu)",
    "permissions": [
      "lead.read",
      "lead.write"
    ],
    "env": "LP_ORG_B_OWNER_EMAIL / LP_ORG_B_OWNER_PASSWORD"
  },
  "SUPER_ADMIN": {
    "role": "Quản trị nền tảng",
    "permissions": [
      "platform:SUPER_ADMIN"
    ],
    "env": "LP_SUPER_ADMIN_EMAIL / LP_SUPER_ADMIN_PASSWORD"
  }
}
```

### Dữ liệu cố định của chuỗi smoke

```json
{
  "pageName": "SMOKE LP 20261111-01",
  "headline": "SMOKE-HEADLINE-20261111",
  "sub": "SMOKE-SUB-20261111",
  "leadName": "Nguyễn Smoke Test",
  "leadPhone": "0900000001",
  "leadEmail": "smoke.lead.20261111@example.com"
}
```

### Body tạo trang trống: POST /landing-pages

```json
{
  "mode": "blank",
  "name": "SMOKE LP 20261111-01",
  "idempotencyKey": "idem-SMOKE LP 20261111-01"
}
```

### Spec trang mẫu (draftSpec) do makeSpec() sinh ra

```json
{
  "version": 1,
  "theme": "MODERN",
  "themeTokens": {
    "primary": "#2563eb",
    "background": "#ffffff",
    "text": "#0f172a"
  },
  "seo": {
    "title": "SEO Tiêu đề thử nghiệm",
    "metaDescription": "Mô tả thử nghiệm cho trang landing.",
    "canonical": null,
    "ogImage": null,
    "robotsIndex": true
  },
  "blocks": [
    {
      "id": "p0_hero",
      "type": "Hero",
      "enabled": true,
      "spacing": "lg",
      "headline": "Tiêu đề thử nghiệm",
      "subheadline": "Phụ đề thử nghiệm",
      "ctaLabel": "Đăng ký ngay",
      "ctaUrl": "#lead-form",
      "imageUrl": null
    },
    {
      "id": "p0_benefits",
      "type": "Benefits",
      "enabled": true,
      "spacing": "md",
      "headline": "Lợi ích",
      "items": [
        {
          "id": "b1",
          "title": "Nhanh chóng",
          "description": "Triển khai trong vài phút."
        },
        {
          "id": "b2",
          "title": "Chuyên nghiệp",
          "description": "Giao diện chuẩn conversion."
        }
      ]
    },
    {
      "id": "p0_form",
      "type": "LeadForm",
      "enabled": true,
      "spacing": "md",
      "headline": "Để lại thông tin",
      "submitLabel": "Gửi thông tin",
      "successMessage": "Cảm ơn bạn! Chúng tôi đã nhận được thông tin.",
      "fields": [
        {
          "id": "f1",
          "name": "name",
          "label": "Họ tên",
          "fieldType": "text",
          "required": true,
          "placeholder": "Nguyễn Văn A"
        },
        {
          "id": "f2",
          "name": "phone",
          "label": "Số điện thoại",
          "fieldType": "tel",
          "required": true,
          "placeholder": "09xx xxx xxx"
        },
        {
          "id": "f3",
          "name": "email",
          "label": "Email",
          "fieldType": "email",
          "required": false,
          "placeholder": "ban@email.com"
        }
      ]
    },
    {
      "id": "p0_footer",
      "type": "Footer",
      "enabled": true,
      "spacing": "sm",
      "body": "© Ai Bee Go test"
    }
  ],
  "meta": {
    "clientRevision": 0
  }
}
```

### Body autosave: POST /landing-pages/:id/autosave

```json
{
  "draftSpec": {
    "version": 1,
    "theme": "MODERN",
    "themeTokens": {
      "primary": "#2563eb",
      "background": "#ffffff",
      "text": "#0f172a"
    },
    "seo": {
      "title": "SEO AS-01",
      "metaDescription": "Mô tả thử nghiệm cho trang landing.",
      "canonical": null,
      "ogImage": null,
      "robotsIndex": true
    },
    "blocks": [
      {
        "id": "p0_hero",
        "type": "Hero",
        "enabled": true,
        "spacing": "lg",
        "headline": "AS-01",
        "subheadline": "Phụ đề thử nghiệm",
        "ctaLabel": "Đăng ký ngay",
        "ctaUrl": "#lead-form",
        "imageUrl": null
      },
      {
        "id": "p0_benefits",
        "type": "Benefits",
        "enabled": true,
        "spacing": "md",
        "headline": "Lợi ích",
        "items": [
          {
            "id": "b1",
            "title": "Nhanh chóng",
            "description": "Triển khai trong vài phút."
          },
          {
            "id": "b2",
            "title": "Chuyên nghiệp",
            "description": "Giao diện chuẩn conversion."
          }
        ]
      },
      {
        "id": "p0_form",
        "type": "LeadForm",
        "enabled": true,
        "spacing": "md",
        "headline": "Để lại thông tin",
        "submitLabel": "Gửi thông tin",
        "successMessage": "Cảm ơn bạn! Chúng tôi đã nhận được thông tin.",
        "fields": [
          {
            "id": "f1",
            "name": "name",
            "label": "Họ tên",
            "fieldType": "text",
            "required": true,
            "placeholder": "Nguyễn Văn A"
          },
          {
            "id": "f2",
            "name": "phone",
            "label": "Số điện thoại",
            "fieldType": "tel",
            "required": true,
            "placeholder": "09xx xxx xxx"
          },
          {
            "id": "f3",
            "name": "email",
            "label": "Email",
            "fieldType": "email",
            "required": false,
            "placeholder": "ban@email.com"
          }
        ]
      },
      {
        "id": "p0_footer",
        "type": "Footer",
        "enabled": true,
        "spacing": "sm",
        "body": "© Ai Bee Go test"
      }
    ],
    "meta": {}
  },
  "baseRevision": 0,
  "clientRevision": 1,
  "requestId": "req-0001",
  "name": "Tên mới"
}
```

### Lead hợp lệ: POST /landing-pages/public/:slug/lead

```json
{
  "fields": {
    "name": "Nguyễn Văn Test",
    "phone": "0900000002",
    "email": "lead.valid@example.com"
  },
  "blockId": "p0_form",
  "visitorId": "visitor-lpt-0001",
  "sessionId": "session-lpt-0001",
  "device": "desktop",
  "referrer": "https://www.google.com/",
  "attribution": {
    "utmSource": "facebook",
    "utmMedium": "cpc",
    "utmCampaign": "lpt-campaign"
  }
}
```

### Các biến thể lead (biên/spam/làm sạch)

```json
{
  "chiCoSdt": {
    "fields": {
      "name": "Chỉ SĐT",
      "phone": "0900000003"
    }
  },
  "chiCoEmail": {
    "fields": {
      "name": "Chỉ Email",
      "email": "only.email@example.com"
    }
  },
  "thieuCaHai": {
    "fields": {
      "name": "Thiếu liên hệ"
    }
  },
  "honeypot": {
    "fields": {
      "name": "Bot",
      "phone": "0900000004"
    },
    "website": "http://spam.example"
  },
  "htmlTrongTen": {
    "fields": {
      "name": "<b>Tên</b><script>alert(1)</script>",
      "phone": "0900000005"
    }
  },
  "tenDai": {
    "fields": {
      "name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "phone": "0900000006"
    }
  },
  "unicode": {
    "fields": {
      "name": "Trần Thị Ánh Nguyệt — 😀",
      "phone": "0900000007"
    }
  }
}
```

### Dữ liệu sinh ngẫu nhiên mỗi lần gọi (tránh đụng giới hạn tần suất / chống lặp)

```json
{
  "IP_qua_X_Forwarded_For": "198.18.149.2",
  "SDT": "0903007301",
  "email": "lpt.mwbs4vy1.2@example.com",
  "IP_cố_định": [
    "203.0.113.10",
    "203.0.113.11",
    "203.0.113.12",
    "198.51.100.7"
  ]
}
```

### Sự kiện theo dõi: POST /landing-pages/public/:slug/events

```json
{
  "eventType": "PAGE_VIEW",
  "visitorId": "visitor-lpt-0002",
  "sessionId": "session-lpt-0002",
  "device": "mobile",
  "utmSource": "facebook",
  "utmMedium": "cpc"
}
```

### Motion: 11 kiểu hiệu ứng

```json
[
  "fade",
  "slide-down",
  "slide-up",
  "slide-right",
  "slide-left",
  "zoom-in",
  "zoom-out",
  "slide-down-right",
  "slide-down-left",
  "slide-up-right",
  "slide-up-left"
]
```

### Motion: đầu vào "bẩn" → kết quả mong đợi sau khi làm sạch

```json
{
  "hopLe": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": 100
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": 100
    }
  },
  "presetLa": {
    "in": {
      "preset": "spin-3d",
      "trigger": "scroll",
      "duration": 600,
      "delay": 0
    }
  },
  "triggerLa": {
    "in": {
      "preset": "fade",
      "trigger": "hover",
      "duration": 600,
      "delay": 0
    }
  },
  "triggerLoad": {
    "in": {
      "preset": "fade",
      "trigger": "load",
      "duration": 600,
      "delay": 0
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": 0
    }
  },
  "durationThap": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 10,
      "delay": 0
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 150,
      "delay": 0
    }
  },
  "durationCao": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 99999,
      "delay": 0
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 1200,
      "delay": 0
    }
  },
  "delayAm": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": -50
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": 0
    }
  },
  "delayCao": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": 5000
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600,
      "delay": 400
    }
  },
  "thieuSo": {
    "in": {
      "preset": "fade",
      "trigger": "scroll"
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 1200,
      "delay": 0
    }
  },
  "khongPhaiSo": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": "nhanh",
      "delay": null
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 1200,
      "delay": 0
    }
  },
  "lamTron": {
    "in": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 600.6,
      "delay": 10.4
    },
    "out": {
      "preset": "fade",
      "trigger": "scroll",
      "duration": 601,
      "delay": 10
    }
  }
}
```

### Motion: khóa phần tử hợp lệ / không hợp lệ

```json
{
  "hopLe": [
    "image",
    "form",
    "grid:0",
    "grid:12",
    "countdown:cd1",
    "item:abc",
    "field:headline"
  ],
  "khongHopLe": [
    "",
    "grid:",
    "grid:-1",
    "grid:x",
    "random",
    "field:",
    "field:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "item:\u0000bad"
  ]
}
```

### Tên miền: đầu vào → chuẩn hóa → hợp lệ?

```json
[
  {
    "in": "shop.example.com",
    "normalized": "shop.example.com",
    "valid": true
  },
  {
    "in": "  HTTPS://Shop.Example.COM/  ",
    "normalized": "shop.example.com",
    "valid": true,
    "note": "bỏ khoảng trắng, giao thức, đường dẫn, viết thường"
  },
  {
    "in": "www.example.vn",
    "normalized": "example.vn",
    "valid": true,
    "note": "tiền tố www. bị bỏ"
  },
  {
    "in": "Shop.Example.com:8080/abc",
    "normalized": "shop.example.com",
    "valid": true,
    "note": "bỏ cổng và đường dẫn"
  },
  {
    "in": "sub.domain.example.co.uk.",
    "normalized": "sub.domain.example.co.uk",
    "valid": true,
    "note": "bỏ dấu chấm cuối"
  },
  {
    "in": "localhost",
    "normalized": "localhost",
    "valid": false
  },
  {
    "in": "a.b",
    "normalized": "a.b",
    "valid": false,
    "note": "TLD 1 ký tự"
  },
  {
    "in": "khong hop le",
    "normalized": "khong hop le",
    "valid": false
  },
  {
    "in": "a..b.com",
    "normalized": "a..b.com",
    "valid": false
  },
  {
    "in": "-bad.example.com",
    "normalized": "-bad.example.com",
    "valid": false
  },
  {
    "in": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.com",
    "normalized": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.com",
    "valid": false,
    "note": "nhãn 64 ký tự"
  },
  {
    "in": "xn--e1afmkfd.xn--p1ai",
    "normalized": "xn--e1afmkfd.xn--p1ai",
    "valid": false,
    "note": "GHI NHẬN: tên miền punycode (IDN) bị coi là không hợp lệ — cần xác nhận có chủ đích không"
  }
]
```

### Tên miền nội bộ bị chặn (SSRF)

```json
[
  "localhost.example.com",
  "my.server.local",
  "localhost"
]
```

### Gói mẫu ZIP: manifest.json

```json
{
  "format": "aibeego.landing-template",
  "formatVersion": 1,
  "slug": "lpt-mau-hop-le",
  "name": "LPT Mẫu hợp lệ",
  "category": "agency",
  "theme": "MODERN",
  "description": "Mẫu giả dùng cho kiểm thử",
  "tags": [
    "lpt"
  ]
}
```

### Gói mẫu ZIP: template.json

```json
{
  "version": 1,
  "theme": "MODERN",
  "seo": {
    "title": "LPT",
    "metaDescription": "LPT",
    "canonical": null,
    "ogImage": null,
    "robotsIndex": true
  },
  "blocks": [
    {
      "id": "h",
      "type": "Hero",
      "enabled": true,
      "headline": "Xin chào",
      "subheadline": "Mẫu giả",
      "ctaLabel": "Gửi",
      "ctaUrl": "#lead-form",
      "imageUrl": null
    },
    {
      "id": "f",
      "type": "LeadForm",
      "enabled": true,
      "headline": "Form",
      "submitLabel": "Gửi",
      "fields": [
        {
          "id": "f1",
          "name": "phone",
          "label": "SĐT",
          "fieldType": "tel",
          "required": true
        }
      ]
    }
  ]
}
```

### Gói mẫu ZIP tự dựng bằng validPack(): danh sách tệp bên trong

```json
{
  "manifest.json": "206 byte",
  "template.json": "457 byte"
}
```

### HTML mẫu (gói chỉ có index.html)

```json
"<!doctype html><html><head><title>LPT HTML</title></head><body><h1>Xin chào</h1><p>Mẫu HTML giả</p><script>window.x=1</script></body></html>"
```

### Ảnh PNG 1x1 dùng làm asset

```json
{
  "bytes": 70
}
```


## C. Dữ liệu bộ test gửi vào hệ thống: các API được gọi

Sinh tự động bằng cách quét mã test. Mọi đường dẫn có tiền tố `/api/v1`. `:id` là id trang, `:slug` là slug trang. Route có dấu `(không token)` được gọi không kèm `Authorization`.

| Phương thức | Đường dẫn (sau `{LP_API_BASE}`) | Số case | Ví dụ mã case |
|---|---|---|---|
| GET | `/landing-pages` | 8 | LP01-S07-TC007, LP08-S01-TC001, LP08-S01-TC002 … |
| POST | `/landing-pages` | 40 | LP01-S01-TC001, LP01-S01-TC003, LP01-S01-TC005 … |
| GET | `/landing-pages  (không token)` | 1 | LP08-S01-TC011 |
| POST | `/landing-pages  (không token)` | 1 | LP01-S07-TC006 |
| POST | `/landing-pages (+ POST :id/autosave)` | 43 | LP05-S01-TC005, LP05-S03-TC001, LP05-S03-TC007 … |
| POST | `/landing-pages + autosave + publish` | 19 | LP06-S01-TC001, LP06-S01-TC002, LP06-S01-TC003 … |
| POST | `/landing-pages/00000000-0000-0000-0000-000000000000/autosave` | 1 | LP05-S08-TC005 |
| GET | `/landing-pages/:id` | 15 | LP01-S01-TC001, LP01-S01-TC005, LP01-S01-TC006 … |
| POST | `/landing-pages/:id/ai-suggest-field` | 3 | LP10-S01-TC005, LP10-S01-TC013, LP10-S01-TC014 |
| POST | `/landing-pages/:id/archive` | 3 | LP07-S02-TC003, LP08-S03-TC004, LP08-S03-TC013 |
| POST | `/landing-pages/:id/autosave` | 19 | LP01-S04-TC002, LP05-S01-TC001, LP05-S01-TC003 … |
| POST | `/landing-pages/:id/delete` | 13 | LP01-S01-TC001, LP01-S01-TC007, LP01-S02-TC003 … |
| POST | `/landing-pages/:id/domain` | 4 | LP07-S05-TC001, LP07-S05-TC004, LP07-S05-TC006 … |
| POST | `/landing-pages/:id/domain/verify` | 1 | LP07-S05-TC007 |
| POST | `/landing-pages/:id/duplicate` | 4 | LP08-S03-TC001, LP08-S03-TC002, LP08-S03-TC013 … |
| POST | `/landing-pages/:id/page-doctor` | 1 | LP10-S03-TC012 |
| POST | `/landing-pages/:id/preview-token` | 5 | LP07-S04-TC001, LP07-S04-TC003, LP07-S04-TC004 … |
| POST | `/landing-pages/:id/preview-token/revoke` | 3 | LP07-S04-TC004, LP07-S04-TC011, LP07-S04-TC012 |
| POST | `/landing-pages/:id/publish` | 22 | LP05-S05-TC001, LP05-S05-TC004, LP05-S05-TC005 … |
| POST | `/landing-pages/:id/unpublish` | 6 | LP05-S06-TC002, LP05-S06-TC007, LP05-S08-TC003 … |
| GET | `/landing-pages/:id/versions` | 1 | LP05-S07-TC001 |
| POST | `/landing-pages/:id/versions/9999/restore` | 1 | LP05-S07-TC008 |
| DELETE | `/landing-pages/:x` | 3 | LP08-S03-TC005, LP08-S03-TC013, LP08-S03-TC015 |
| GET | `/landing-pages/:x` | 8 | LP01-S07-TC007, LP05-S08-TC003, LP07-S06-TC001 … |
| PATCH | `/landing-pages/:x` | 4 | LP07-S03-TC007, LP07-S06-TC001, LP07-S06-TC002 … |
| POST | `/landing-pages/:x/autosave  (không token)` | 1 | LP05-S08-TC004 |
| POST | `/landing-pages/:x/domain  (không token)` | 1 | LP07-S05-TC013 |
| POST | `/landing-pages/:x/publish  (không token)` | 1 | LP05-S08-TC004 |
| POST | `/landing-pages/ai-suggest-brief` | 1 | LP01-S05-TC002 |
| GET | `/landing-pages/analytics` | 2 | LP08-S04-TC009, LP08-S04-TC010 |
| POST | `/landing-pages/bulk-delete` | 4 | LP08-S03-TC007, LP08-S03-TC008, LP08-S03-TC009 … |
| GET | `/landing-pages/business-profile` | 1 | LP10-S02-TC011 |
| PATCH | `/landing-pages/business-profile` | 2 | LP10-S02-TC003, LP10-S02-TC011 |
| POST | `/landing-pages/crawl-url` | 1 | LP01-S06-TC004 |
| GET | `/landing-pages/overview` | 1 | LP08-S02-TC005 |
| GET | `/landing-pages/public/:slug` | 12 | LP05-S05-TC001, LP05-S05-TC012, LP05-S06-TC002 … |
| POST | `/landing-pages/public/:slug/events` | 2 | LP06-S05-TC001, LP06-S05-TC003 |
| POST | `/landing-pages/public/:slug/lead` | 14 | LP06-S01-TC001, LP06-S01-TC002, LP06-S01-TC003 … |
| GET | `/landing-pages/public/:x` | 1 | LP07-S07-TC005 |
| GET | `/landing-pages/public/:x  (không token)` | 1 | LP07-S07-TC005 |
| GET | `/landing-pages/public/preview/:x` | 4 | LP07-S04-TC001, LP07-S04-TC003, LP07-S04-TC004 … |
| GET | `/landing-pages/public/preview/:x  (không token)` | 4 | LP07-S04-TC001, LP07-S04-TC003, LP07-S04-TC004 … |
| GET | `/landing-pages/templates` | 15 | LP01-S04-TC002, LP02-S02-TC001, LP02-S02-TC002 … |
| GET | `/landing-pages/templates  (không token)` | 1 | LP02-S07-TC003 |
| GET | `/landing-pages/templates/:id/versions` | 1 | LP09-S06-TC002 |
| POST | `/landing-pages/templates/:id/versions/999999/restore` | 1 | LP09-S06-TC004 |
| GET | `/landing-pages/templates/:x` | 1 | LP01-S04-TC002 |
| POST | `/landing-pages/templates/:x/edit-session` | 4 | LP08-S05-TC001, LP09-S02-TC001, LP09-S02-TC003 … |
| GET | `/landing-pages/templates/khong-ton-tai-lpt-xyz` | 1 | LP02-S03-TC003 |
| POST | `/landing-pages/templates/khong-ton-tai-lpt-xyz/edit-session` | 1 | LP09-S02-TC014 |
| GET | `/leads?search=…` | 7 | LP06-S01-TC001, LP06-S01-TC003, LP06-S01-TC004 … |

## D. Ví dụ nhật ký chạy thật (lớp unit, không cần máy chủ)

Lấy nguyên văn từ `artifacts/last-unit-run.txt`. Chỉ các case lớp unit mới có nhật ký, vì các case HTTP và trình duyệt chưa được chạy (chưa có stack test).

### LP05-S01-TC004

```text
    ┏━━ LP05-S01-TC004
    ┃ [SYSTEM] cùng requestId, khác nội dung:
       {
        "storedRevision": 3,
        "storedRequestId": "req-0003",
        "baseRevision": 3,
        "incomingRevision": 4,
        "requestId": "req-0003",
        "storedRequestHash": "fdfe437b3cce32f706214dd0b5a17bc97e258153ce9d9ec929b116d0d20b51c5",
        "requestHash": "ff3761552bab855f842ed3f856d659fcc35c916a2e72a7d354cd954f42b4125d"
      }
    ┃ [ACTUAL] quyết định:
       {
        "action": "reject",
        "storedRevision": 3
      }
```

### LP11-S02-TC003

```text
    ┏━━ LP11-S02-TC003
```

### LP07-S05-TC003

```text
    ┏━━ LP07-S05-TC003
```

### LP09-S04-TC003

```text
    ┏━━ LP09-S04-TC003
    ┃ [FAKE] dữ liệu có khóa nhạy cảm:
       {
        "name": "Mẫu",
        "password": "***",
        "apiKey": "k",
        "nested": {
          "clientSecret": "***",
          "Authorization": "***",
          "keep": 1
        },
        "list": [
          {
            "access_token": "***",
            "ok": true
          }
        ],
        "themeTokens": {
          "primary": "#2563eb"
        }
      }
    ┃ [ACTUAL] sau khi lọc:
       {
        "name": "Mẫu",
        "nested": {
          "keep": 1
        },
        "list": [
          {
            "ok": true
          }
        ],
        "themeTokens": {
          "primary": "#2563eb"
        }
      }
```

## E. Biến môi trường (dữ liệu hệ thống bắt buộc để chạy lớp api/e2e)

| Biến | Bắt buộc cho | Ý nghĩa |
|---|---|---|
| `LP_API_BASE` | api, e2e | Gốc API của **môi trường test**, ví dụ `http://127.0.0.1:4000/api/v1`. Không có giá trị mặc định |
| `LP_WEB_BASE` | e2e | Gốc web, ví dụ `http://127.0.0.1:3000` |
| `LP_ALLOW_REMOTE=1` | khi host không phải localhost | Cho phép chạy với host khác. Mặc định bị chặn để không ghi dữ liệu test lên production |
| `LP_ORG_A_OWNER_EMAIL` / `_PASSWORD` | hầu hết case api | Chủ tổ chức A (`lead.read` + `lead.write`) |
| `LP_ORG_A_VIEWER_EMAIL` / `_PASSWORD` | case phân quyền | Thành viên A chỉ có `lead.read` |
| `LP_ORG_B_OWNER_EMAIL` / `_PASSWORD` | case tách tổ chức | Chủ tổ chức B |
| `LP_SUPER_ADMIN_EMAIL` / `_PASSWORD` | LP09 và vài case LP02/LP08 | Quản trị nền tảng |
| `LP_RUN_ID` | tùy chọn | Ép tiền tố dữ liệu của lần chạy (mặc định tự sinh `LPT-<ngày>-<4 ký tự>`) |
| `LP_TRACE`, `LP_TRACE_FILE` | tùy chọn | Bật/tắt nhật ký, ghi nhật ký ra tệp |

