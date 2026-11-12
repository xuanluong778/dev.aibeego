# DỮ LIỆU GIẢ (FAKE) DÙNG TRONG BỘ TEST LANDING PAGE

## RUN_ID và cách đặt tên dữ liệu tạo ra trong mỗi lần chạy

```json
{
  "RUN_ID": "LPT-20261111-kip0",
  "uniq": "LPT trang LPT-20261111-kip0-1",
  "uniqSlug": "lpt-slug-lpt-20261111-kip0-2"
}
```

## Tài khoản (mật khẩu lấy từ biến môi trường, không có trong mã)

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

## Dữ liệu cố định của chuỗi smoke

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

## Body tạo trang trống: POST /landing-pages

```json
{
  "mode": "blank",
  "name": "SMOKE LP 20261111-01",
  "idempotencyKey": "idem-SMOKE LP 20261111-01"
}
```

## Spec trang mẫu (draftSpec) do makeSpec() sinh ra

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

## Body autosave: POST /landing-pages/:id/autosave

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

## Lead hợp lệ: POST /landing-pages/public/:slug/lead

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

## Các biến thể lead (biên/spam/làm sạch)

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

## Dữ liệu sinh ngẫu nhiên mỗi lần gọi (tránh đụng giới hạn tần suất / chống lặp)

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

## Sự kiện theo dõi: POST /landing-pages/public/:slug/events

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

## Motion: 11 kiểu hiệu ứng

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

## Motion: đầu vào "bẩn" → kết quả mong đợi sau khi làm sạch

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

## Motion: khóa phần tử hợp lệ / không hợp lệ

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

## Tên miền: đầu vào → chuẩn hóa → hợp lệ?

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

## Tên miền nội bộ bị chặn (SSRF)

```json
[
  "localhost.example.com",
  "my.server.local",
  "localhost"
]
```

## Gói mẫu ZIP: manifest.json

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

## Gói mẫu ZIP: template.json

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

## Gói mẫu ZIP tự dựng bằng validPack(): danh sách tệp bên trong

```json
{
  "manifest.json": "206 byte",
  "template.json": "457 byte"
}
```

## HTML mẫu (gói chỉ có index.html)

```json
"<!doctype html><html><head><title>LPT HTML</title></head><body><h1>Xin chào</h1><p>Mẫu HTML giả</p><script>window.x=1</script></body></html>"
```

## Ảnh PNG 1x1 dùng làm asset

```json
{
  "bytes": 70
}
```
