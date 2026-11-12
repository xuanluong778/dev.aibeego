# Bulk template ZIPs: API accepts 256 MiB, plus multipart framing.
# Included inside aibeego.com's HTTPS server; other locations retain their limits.
location = /api/v1/landing-pages/templates/packs/bulk {
    client_max_body_size 270m;
    client_body_timeout 600s;
    proxy_request_buffering off;
    proxy_pass http://aibeego_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
    proxy_buffering off;
}
