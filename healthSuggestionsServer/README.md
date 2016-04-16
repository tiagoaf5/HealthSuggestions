healthSuggestions Server
===================



**initial command:**

> gunicorn --env DJANGO_SETTINGS_MODULE=server.settings healthSuggestions.wsgi -b healthsuggestions.fe.up.pt:8001


**command:**

> /opt/myenv/bin/gunicorn -c /opt/myenv/gunicorn_config.py
> healthSuggestions.wsgi

**/opt/myenv/gunicorn_config.py:**

    command = '/opt/myenv/bin/gunicorn'
    pythonpath = '/opt/myenv/healthSuggestions'
    bind = 'unix:/opt/myenv/healthSuggestions/gunicorn.sock'
    workers = 5
    user = 'taf'
    env = 'DJANGO_SETTINGS_MODULE=server.settings'
    name = 'healthSuggestionsServer'

**supervisor settings at /etc/supervisor/conf.d/healthSuggestions.conf**

    [program:healthSuggestions]
    command = /opt/myenv/bin/gunicorn -c /opt/myenv/gunicorn_config.py healthSuggestions.wsgi    ; Command to start app
    user = taf                                                                                   ; User to run as
    stdout_logfile = /opt/myenv/logs/gunicorn_supervisor.out.log                                 ; Where to write log messages
    stderr_logfile = /opt/myenv/logs/gunicorn_supervisor.err.log                                 ; Where to write err messages
    environment=LANG=en_US.UTF-8,LC_ALL=en_US.UTF-8                                              ; Set UTF-8 as default encoding
    autostart=true                                                                               ; tells should be started when the system boots
    autorestart=true                                                                             ; always restart the program after it exits


**ngynx configuration file at /etc/nginx/sites-available/healthSuggestions**

    upstream hello_app_server {
      # fail_timeout=0 means we always retry an upstream even if it failed
      # to return a good HTTP response (in case the Unicorn master nukes a
      # single worker for timing out).
     
      server unix:/opt/myenv/healthSuggestions/gunicorn.sock fail_timeout=0;
    }
     
    server {
     
        listen   80;
        server_name healthsuggestions.fe.up.pt;
     
        client_max_body_size 4G;
     
        access_log /opt/myenv/logs/nginx-access.log;
        error_log /opt/myenv/logs/nginx-error.log;
     
        location /static/ {
            alias   /opt/myenv/static/;
        }
     
        location / {
            # an HTTP header important enough to have its own Wikipedia entry:
            #   http://en.wikipedia.org/wiki/X-Forwarded-For
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     
            # enable this if and only if you use HTTPS, this helps Rack
            # set the proper protocol for doing redirects:
            # proxy_set_header X-Forwarded-Proto https;
     
            # pass the Host: header from the client right along so redirects
            # can be set properly within the Rack application
            proxy_set_header Host $http_host;
     
            # we don't want nginx trying to do something clever with
            # redirects, we set the Host: header above already.
            proxy_redirect off;
     
            # set "proxy_buffering off" *only* for Rainbows! when doing
            # Comet/long-poll stuff.  It's also safe to set if you're
            # using only serving fast clients with Unicorn + nginx.
            # Otherwise you _want_ nginx to buffer responses to slow
            # clients, really.
            # proxy_buffering off;
     
            # Try to serve static files from nginx, no point in making an
            # *application* server like Unicorn/Rainbows! serve static files.
            if (!-f $request_filename) {
                proxy_pass http://hello_app_server;
                break;
            }
        }
     
        # Error pages
        error_page 500 502 503 504 /500.html;
        location = /500.html {
            root /opt/myenv/static/;
        }
    }

**dependecies:**

> pip install django 
> pip install psycopg2 
> pip install djangorestframework 
> pip install gunicorn 
> pip install setpoctitle