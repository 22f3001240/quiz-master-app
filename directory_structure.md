quiz-master-v2/
│ 
├── app.py        # Flask application setup
│
├── application/
│   ├── config.py            # Configuration file (already provided)
│   ├── database.py          # Database setup (already provided)
│   ├── models.py            # Database models (already provided)
│   ├── resources.py         # API resources (already provided)
│   ├── routes.py            # Route definitions (already provided)
│   ├── tasks.py             # Celery tasks (to be created)
│   └── utils.py             # Utility functions (to be created)
│
├── static/
│   ├── css/
│   │   └── style.css         # Custom CSS (created)
│   ├── js/
│   │   ├── app.js            # Main Vue app (created)
│   │   ├── auth.js           # Authentication components (created)
│   │   ├── admin.js          # Admin components (created)
│   │   └── user.js           # User components (created)
│   └── img/                   # Images folder (empty)
│
├── templates/
│   └── index.html            # Main template (created)
│
├── celery_worker.py          # Celery worker script (to be created)
└── requirements.txt          # Project dependencies (to be created)