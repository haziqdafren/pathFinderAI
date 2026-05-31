"""
PathFinder AI — Canonical Skill Dictionary
Normalizes skill name variants to canonical form, grouped by cluster.
Usage: canonical_skills[cluster].get(skill_variant.lower(), skill_variant)
"""

# ============================================================
# CLUSTER 1: DATA (Data Analyst, BI, Data Engineer, Analytics Engineer)
# ============================================================
data_skills = {
    # SQL variants
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "sqlite": "SQLite",
    "ms sql": "SQL Server",
    "sql server": "SQL Server",
    "microsoft sql server": "SQL Server",
    "mssql": "SQL Server",
    "oracle sql": "Oracle SQL",
    "bigquery": "BigQuery",
    "google bigquery": "BigQuery",
    "snowflake": "Snowflake",
    "redshift": "AWS Redshift",
    "aws redshift": "AWS Redshift",

    # Excel / Spreadsheet
    "excel": "Excel",
    "microsoft excel": "Excel",
    "ms excel": "Excel",
    "advanced excel": "Excel (Advanced)",
    "google sheets": "Google Sheets",
    "spreadsheet": "Excel",

    # BI Tools
    "tableau": "Tableau",
    "tableau desktop": "Tableau",
    "tableau public": "Tableau",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "microsoft power bi": "Power BI",
    "looker": "Looker",
    "looker studio": "Looker Studio",
    "google data studio": "Looker Studio",
    "data studio": "Looker Studio",
    "metabase": "Metabase",
    "superset": "Apache Superset",
    "apache superset": "Apache Superset",
    "qlik": "Qlik",
    "qliksense": "Qlik",

    # Python / Data Stack
    "python": "Python",
    "python3": "Python",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "plotly": "Plotly",
    "jupyter": "Jupyter Notebook",
    "jupyter notebook": "Jupyter Notebook",

    # ETL / Pipeline
    "dbt": "dbt",
    "data build tool": "dbt",
    "airflow": "Apache Airflow",
    "apache airflow": "Apache Airflow",
    "luigi": "Luigi",
    "etl": "ETL",
    "elt": "ELT",
    "pentaho": "Pentaho",
    "talend": "Talend",
    "informatica": "Informatica",

    # Data Warehouse
    "data warehouse": "Data Warehouse",
    "data warehousing": "Data Warehouse",
    "data lake": "Data Lake",
    "data lakehouse": "Data Lakehouse",
    "olap": "OLAP",

    # Big Data
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "pyspark": "PySpark",
    "hadoop": "Hadoop",
    "hive": "Hive",
    "kafka": "Apache Kafka",
    "apache kafka": "Apache Kafka",

    # Statistics
    "statistics": "Statistics",
    "statistik": "Statistics",
    "statistical analysis": "Statistics",
    "analisis statistik": "Statistics",
    "probability": "Statistics",
    "r": "R",
    "r language": "R",
    "r programming": "R",

    # General Data
    "data analysis": "Data Analysis",
    "data analytics": "Data Analysis",
    "analisis data": "Data Analysis",
    "data visualization": "Data Visualization",
    "visualisasi data": "Data Visualization",
    "data cleaning": "Data Cleaning",
    "data wrangling": "Data Cleaning",
    "data quality": "Data Quality",
    "business intelligence": "Business Intelligence",
    "bi": "Business Intelligence",
    "kpi": "KPI & Metrics",
    "metrics": "KPI & Metrics",
}

# ============================================================
# CLUSTER 2: DEV (Backend, Frontend, Full Stack, Mobile, Software Engineer)
# ============================================================
dev_skills = {
    # Languages
    "python": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "java": "Java",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "dart": "Dart",
    "php": "PHP",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "c#": "C#",
    "dotnet": ".NET",
    ".net": ".NET",
    "c++": "C++",
    "ruby": "Ruby",
    "scala": "Scala",

    # Frontend
    "react": "React.js",
    "react.js": "React.js",
    "reactjs": "React.js",
    "react js": "React.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "nuxt": "Nuxt.js",
    "angular": "Angular",
    "svelte": "Svelte",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "sass": "SASS/SCSS",
    "scss": "SASS/SCSS",
    "redux": "Redux",
    "zustand": "Zustand",

    # Backend Frameworks
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "laravel": "Laravel",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "nestjs": "NestJS",
    "nest.js": "NestJS",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "gin": "Gin (Go)",
    "fiber": "Fiber (Go)",

    # Mobile
    "flutter": "Flutter",
    "react native": "React Native",
    "android": "Android Development",
    "android development": "Android Development",
    "android studio": "Android Development",
    "ios": "iOS Development",
    "ios development": "iOS Development",
    "jetpack compose": "Jetpack Compose",
    "swiftui": "SwiftUI",

    # Databases
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "firebase": "Firebase",
    "firestore": "Firebase",
    "supabase": "Supabase",
    "dynamodb": "DynamoDB",

    # API / Architecture
    "rest api": "REST API",
    "restful api": "REST API",
    "restful": "REST API",
    "rest": "REST API",
    "graphql": "GraphQL",
    "websocket": "WebSocket",
    "microservices": "Microservices",
    "api": "REST API",

    # Tools
    "git": "Git",
    "github": "Git/GitHub",
    "gitlab": "Git/GitLab",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "figma": "Figma",
    "postman": "Postman",
    "jira": "JIRA",
    "agile": "Agile",
    "scrum": "Scrum",
    "oop": "OOP",
    "object oriented": "OOP",
    "object-oriented programming": "OOP",
    "data structures": "Data Structures & Algorithms",
    "algorithms": "Data Structures & Algorithms",
    "dsa": "Data Structures & Algorithms",
}

# ============================================================
# CLUSTER 3: ML (ML Engineer, Data Scientist, AI Engineer, NLP, CV)
# ============================================================
ml_skills = {
    # Core ML
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",

    # Frameworks
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "keras": "Keras",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "xgboost": "XGBoost",
    "lightgbm": "LightGBM",
    "catboost": "CatBoost",

    # Neural Networks
    "cnn": "CNN",
    "convolutional neural network": "CNN",
    "rnn": "RNN",
    "lstm": "LSTM",
    "transformer": "Transformers",
    "transformers": "Transformers",
    "attention mechanism": "Transformers",
    "bert": "BERT",
    "gpt": "GPT",
    "llm": "LLM",
    "large language model": "LLM",

    # NLP
    "nlp": "NLP",
    "natural language processing": "NLP",
    "nltk": "NLTK",
    "spacy": "spaCy",
    "hugging face": "Hugging Face",
    "huggingface": "Hugging Face",
    "sentiment analysis": "Sentiment Analysis",
    "text classification": "Text Classification",
    "named entity recognition": "NER",
    "ner": "NER",

    # Computer Vision
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "opencv": "OpenCV",
    "open cv": "OpenCV",
    "yolo": "YOLO",
    "object detection": "Object Detection",
    "image classification": "Image Classification",
    "image segmentation": "Image Segmentation",

    # Generative AI / LLM
    "generative ai": "Generative AI",
    "gen ai": "Generative AI",
    "langchain": "LangChain",
    "rag": "RAG",
    "retrieval augmented generation": "RAG",
    "prompt engineering": "Prompt Engineering",
    "fine-tuning": "Fine-tuning",
    "finetuning": "Fine-tuning",
    "vector database": "Vector Database",
    "vector db": "Vector Database",
    "embeddings": "Embeddings",
    "openai": "OpenAI API",
    "openai api": "OpenAI API",
    "gemini": "Gemini API",
    "gemini api": "Gemini API",
    "anthropic": "Claude API",

    # MLOps
    "mlops": "MLOps",
    "ml ops": "MLOps",
    "mlflow": "MLflow",
    "model deployment": "Model Deployment",
    "model serving": "Model Serving",
    "model monitoring": "MLOps",
    "feature store": "Feature Store",
    "feature engineering": "Feature Engineering",
    "kubeflow": "Kubeflow",

    # Stats / Math
    "statistics": "Statistics",
    "probability": "Statistics",
    "linear algebra": "Linear Algebra",
    "calculus": "Calculus",
    "a/b testing": "A/B Testing",
    "ab testing": "A/B Testing",
    "experimentation": "A/B Testing",

    # Python Data Stack (also in ML)
    "python": "Python",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "jupyter": "Jupyter Notebook",
    "sql": "SQL",
    "git": "Git",
    "docker": "Docker",
}

# ============================================================
# CLUSTER 4: INFRA (DevOps, Cloud, SysAdmin, Network, QA, Security)
# ============================================================
infra_skills = {
    # Cloud Platforms
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "digital ocean": "DigitalOcean",
    "linode": "Linode",
    "alibaba cloud": "Alibaba Cloud",

    # Containers / Orchestration
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "docker compose": "Docker Compose",
    "docker swarm": "Docker Swarm",
    "helm": "Helm",
    "openshift": "OpenShift",
    "containerd": "Containerd",

    # CI/CD
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI",
    "gitlab ci/cd": "GitLab CI",
    "circle ci": "CircleCI",
    "travis ci": "Travis CI",
    "argo cd": "ArgoCD",
    "argocd": "ArgoCD",

    # Infrastructure as Code
    "terraform": "Terraform",
    "ansible": "Ansible",
    "puppet": "Puppet",
    "chef": "Chef",
    "pulumi": "Pulumi",
    "iac": "Infrastructure as Code",
    "infrastructure as code": "Infrastructure as Code",
    "cloudformation": "AWS CloudFormation",

    # Monitoring / Observability
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "elk": "ELK Stack",
    "elasticsearch": "Elasticsearch",
    "kibana": "Kibana",
    "logstash": "Logstash",
    "datadog": "Datadog",
    "new relic": "New Relic",
    "splunk": "Splunk",
    "zabbix": "Zabbix",

    # OS / Linux
    "linux": "Linux",
    "ubuntu": "Linux",
    "centos": "Linux",
    "debian": "Linux",
    "rhel": "Linux",
    "shell scripting": "Shell Scripting",
    "bash": "Shell Scripting",
    "bash scripting": "Shell Scripting",
    "windows server": "Windows Server",
    "active directory": "Active Directory",
    "ad": "Active Directory",

    # Networking
    "networking": "Networking",
    "tcp/ip": "TCP/IP",
    "tcp ip": "TCP/IP",
    "dns": "DNS",
    "dhcp": "DHCP",
    "vpn": "VPN",
    "firewall": "Firewall",
    "load balancer": "Load Balancing",
    "nginx": "Nginx",
    "apache": "Apache",
    "cisco": "Cisco",
    "ccna": "CCNA",
    "routing": "Routing & Switching",
    "switching": "Routing & Switching",
    "bgp": "BGP",
    "ospf": "OSPF",
    "sd-wan": "SD-WAN",
    "wireshark": "Wireshark",

    # Security
    "cybersecurity": "Cybersecurity",
    "cyber security": "Cybersecurity",
    "information security": "Cybersecurity",
    "penetration testing": "Penetration Testing",
    "pentest": "Penetration Testing",
    "ethical hacking": "Ethical Hacking",
    "vulnerability assessment": "Vulnerability Assessment",
    "siem": "SIEM",
    "soc": "SOC",
    "owasp": "OWASP",
    "kali linux": "Kali Linux",
    "nmap": "Nmap",
    "burp suite": "Burp Suite",
    "ceh": "CEH",
    "comptia security+": "CompTIA Security+",
    "iso 27001": "ISO 27001",

    # Testing
    "manual testing": "Manual Testing",
    "automation testing": "Automation Testing",
    "selenium": "Selenium",
    "cypress": "Cypress",
    "playwright": "Playwright",
    "jmeter": "JMeter",
    "postman": "Postman",
    "api testing": "API Testing",
    "performance testing": "Performance Testing",
    "load testing": "Load Testing",
    "test cases": "Test Case Writing",
    "bug reporting": "Bug Reporting",
    "jira": "JIRA",

    # General
    "git": "Git",
    "python": "Python",
    "scripting": "Shell Scripting",
}

# ============================================================
# MASTER LOOKUP — maps cluster name to its dict
# ============================================================
CANONICAL_SKILLS = {
    "data": data_skills,
    "dev": dev_skills,
    "ml": ml_skills,
    "infra": infra_skills,
    "qa": infra_skills,  # QA/Security uses infra dict
}

def normalize_skill(skill: str, cluster: str) -> str:
    """
    Normalize a skill name to its canonical form.
    Falls back to title-cased original if not found.
    """
    skill_lower = skill.strip().lower()
    skill_dict = CANONICAL_SKILLS.get(cluster, {})
    return skill_dict.get(skill_lower, skill.strip().title())

def normalize_skills_list(skills: list, cluster: str) -> list:
    """
    Normalize a list of skill strings.
    Returns deduplicated list of canonical skill names.
    """
    normalized = [normalize_skill(s, cluster) for s in skills]
    return list(dict.fromkeys(normalized))  # deduplicate, preserve order
