import sqlite3
import json
import uuid
import datetime
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from config import Config

class DatabaseManager:
    def __init__(self):
        self.mode = 'sqlite' # Default fallback
        self.mongo_client = None
        self.mongo_db = None
        
        # Try Mongo first
        try:
            print("Connecting to MongoDB...")
            self.mongo_client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Trigger server connection check
            self.mongo_client.server_info()
            self.mongo_db = self.mongo_client[Config.DB_NAME]
            self.mode = 'mongodb'
            print("Successfully connected to MongoDB! Utilizing MongoDB database mode.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            print("Initializing fallback local SQLite database system...")
            self.mode = 'sqlite'
            self._init_sqlite()

    def _init_sqlite(self):
        conn = sqlite3.connect('farmers_advisory.db')
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')
        
        # Create history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                module TEXT NOT NULL,
                params TEXT NOT NULL,
                result TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("Local SQLite tables configured successfully.")

    def get_sqlite_conn(self):
        conn = sqlite3.connect('farmers_advisory.db')
        conn.row_factory = sqlite3.Row
        return conn

    # ------------------ SEMANTIC API METHODS ------------------

    def get_user_by_email(self, email):
        if self.mode == 'mongodb':
            user = self.mongo_db.users.find_one({'email': email})
            if user:
                user['id'] = str(user.get('_id', ''))
                user.pop('_id', None)
            return user
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None

    def get_user_by_id(self, user_id):
        if self.mode == 'mongodb':
            # MongoDB supports string IDs here as we generate them as string UUIDs to match both backends
            user = self.mongo_db.users.find_one({'id': user_id})
            return user
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None

    def create_user(self, name, email, password, role):
        user_id = str(uuid.uuid4())
        user_doc = {
            'id': user_id,
            'name': name,
            'email': email,
            'password': password,
            'role': role
        }
        
        if self.mode == 'mongodb':
            self.mongo_db.users.insert_one(user_doc)
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                    (user_id, name, email, password, role)
                )
                conn.commit()
            except sqlite3.IntegrityError:
                conn.close()
                raise ValueError("Email already registered")
            conn.close()
            
        return user_doc

    def get_all_users(self):
        if self.mode == 'mongodb':
            users_cursor = self.mongo_db.users.find()
            users = []
            for u in users_cursor:
                u.pop('_id', None)
                users.append(u)
            return users
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, email, role FROM users')
            rows = cursor.fetchall()
            conn.close()
            return [dict(r) for r in rows]

    def update_user_role(self, user_id, role):
        if self.mode == 'mongodb':
            self.mongo_db.users.update_one({'id': user_id}, {'$set': {'role': role}})
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET role = ? WHERE id = ?', (role, user_id))
            conn.commit()
            conn.close()

    def add_history(self, user_id, module, params, result):
        timestamp = datetime.datetime.now().isoformat()
        params_str = json.dumps(params)
        result_str = json.dumps(result)
        
        if self.mode == 'mongodb':
            self.mongo_db.history.insert_one({
                'user_id': user_id,
                'module': module,
                'params': params,
                'result': result,
                'timestamp': timestamp
            })
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO history (user_id, module, params, result, timestamp) VALUES (?, ?, ?, ?, ?)',
                (user_id, module, params_str, result_str, timestamp)
            )
            conn.commit()
            conn.close()

    def get_history(self, user_id):
        if self.mode == 'mongodb':
            history_cursor = self.mongo_db.history.find({'user_id': user_id}).sort('timestamp', -1)
            history = []
            for h in history_cursor:
                h.pop('_id', None)
                history.append(h)
            return history
        else:
            conn = self.get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC', (user_id,))
            rows = cursor.fetchall()
            conn.close()
            
            history = []
            for r in rows:
                h = dict(r)
                h['params'] = json.loads(h['params'])
                h['result'] = json.loads(h['result'])
                history.append(h)
            return history

# Global DB Instance
db = DatabaseManager()
