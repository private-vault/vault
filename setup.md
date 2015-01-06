# Setup vault

Install globally with nodejs

    npm install -g gulp bower

Run these commands

    npm install
    npm run setup
    
Install framework deps:

    composer install
    
Configure application, all overridable configuration is available at **app/config** 

    cp -R app/config/example app/config/local

Create database:

    mysql -u root -p --execute='create database vault;'
    php artisan migrate
    php artisan db:seed
    
Serve with nginx:

    sudo vim /etc/nginx/sites-available/vault.conf
    
Add config to **/etc/nginx/sites-available/vault.conf**:

``` nginx
server {
    listen   80;
    server_name  vault.dev;

    root   /var/www/vault/public;

    error_log /var/log/vault-error.log;
    access_log /var/log/vault-access.log;

    # first check if its a static file, otherwise run through @handler
    location / {
        index index.php;
        try_files $uri @handler;
        #expires 24h;
    }

    # if it was not a static file, execute through index.php
    location @handler {
        rewrite ^(.*)$ /index.php last; # force index.php if it was not a file
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        include        /etc/nginx/fastcgi_params;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

Link config:

    sudo ln -s /etc/nginx/sites-available/vault.conf /etc/nginx/sites-enabled/vault.conf

Reload with new config:

    sudo service nginx reload
    
Add hostname to [see issue](http://pm.datajob.lt/datadog/vault/issues/19):

    vim bootstrap/start.php # at line 29
    
How to login:

    Username: admin
    Password: admin